const uuid = require("uuid");
const path = require("path");
const email = require("../utils/email");
const { literal } = require("sequelize");
const generateJwt = require("../utils/generateJwt");
const ApiError = require("../error/ApiError");
const {
  Event,
  Team,
  Participant,
  TeamParticipants,
  EventTeams,
} = require("../models/models");
class TeamController {
  async create(req, res, next) {
    try {
      const { name, eventId, participants } = req.body;
      const participant = JSON.parse(participants);
      let coach = 0;
      let contactFace = 0;
      let ids = [];
      for (const e of participant) {
        let part = await Participant.create({
          name: e.name,
          emailAdress: e.emailAdress,
          phoneNumbers: e.phoneNumbers,
          organization: e.organization,
          universityFaculty: e.universityFaculty,
          universityCourse: e.universityCourse,
          isCoach: e.isCoach,
          isContactFace: e.isContactFace,
        });

        if (e.isCoach) {
          coach = part.id;
        }
        if (e.isContactFace) {
          email(
            part.emailAdress,
            part.name + ", ваша заявка на участие зарегистрирована!",
            "Участие в соревновании от LidCode"
          ).catch((e) => console.log(e));
          contactFace = part.id;
        }
        ids.push(part.id);
      }
      const team = await Team.create({
        name,
        CoachFaceId: coach,
        ContactFaceId: contactFace,
      });
      EventTeams.create({
        teamId: team.id,
        eventId: eventId,
      });
      for (const id of ids) {
        TeamParticipants.create({
          teamId: team.id,
          participantId: id,
        });
      }
      return res.json(team);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async createNew(req, res, next) {
    try {
      const { name, isCoach, isContactFace, participants } = req.body;
      const participant = JSON.parse(participants);
      const team = await Team.create({
        name,
        CoachFaceId: isCoach,
        ContactFaceId: isContactFace,
      });
      for (const id of participant) {
        TeamParticipants.create({
          teamId: team.id,
          participantId: id,
        });
      }
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getCod(req, res, next) {
    try {
      const { emailAdress } = req.query;
      let cod = Math.floor(Math.random() * (10000 - 0) + 0).toString();
      if (cod.length < 4) {
        cod = "0".repeat(4 - cod.length) + cod;
      }
      await email(
        emailAdress,
        "Код подтверждения: " + cod,
        "Код подтверждения"
      ).catch(() => next(ApiError.badRequest("Код не отправлен")));
      return res.json({ cod });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      let { page } = req.query;
      page = page || 1;
      const limit = 10;
      let offset = limit * page - limit;
      const team = await Team.findAndCountAll({
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: EventTeams,
            include: { model: Event },
          },
        ],
        limit,
        offset,
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...team, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getFree(req, res, next) {
    try {
      const team = await Team.findAndCountAll({
        include: [
          {
            model: EventTeams,
            required: false,
          },
          { model: TeamParticipants },
        ],
        group: ["team.id", "event_teams.id", "team_participants.id"],
        having: literal('"event_teams"."id" IS NULL'),
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...team, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      await Team.destroy({
        where: { id },
      });
      await TeamParticipants.destroy({
        where: { teamId: null },
      });
      await EventTeams.destroy({
        where: { teamId: null },
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async update(req, res, next) {
    try {
      const { id, name, isCoach, isContactFace, approvement, participants } =
        req.body;
      const participant = JSON.parse(participants);
      const partNow = await TeamParticipants.findAll({
        where: { teamId: id },
      });
      for (const i of partNow) {
        if (!participant.includes(i.participantId)) {
          await TeamParticipants.destroy({
            where: { participantId: i.participantId },
          });
        }
      }
      for (const i of participant) {
        let flag = true;
        for (const j of partNow) {
          if (j.participantId === i) {
            flag = false;
          }
        }
        if (flag)
          await TeamParticipants.create({
            teamId: id,
            participantId: i,
          });
      }
      const team = await Team.findOne({
        where: { id },
      });
      const part = await Participant.findOne({ where: { id: isContactFace } });
      if (team.approvement !== approvement) {
        if (approvement === "Подтверждена") {
          email(
            part.emailAdress,
            part.name + ", ваша заявка на участие успешно подтверждена!",
            "Участие в соревновании от LidCode"
          ).catch((e) => console.log(e));
        }
        if (approvement === "Ожидает") {
          email(
            part.emailAdress,
            part.name + ", ваша заявка на участие ожидает подтверждения!",
            "Участие в соревновании от LidCode"
          ).catch((e) => console.log(e));
        }
        if (approvement === "Отменена") {
          email(
            part.emailAdress,
            part.name + ", ваша заявка на участие отклонена!",
            "Участие в соревновании от LidCode"
          ).catch((e) => console.log(e));
        }
      }
      await Team.update(
        {
          name,
          CoachFaceId: isCoach,
          ContactFaceId: isContactFace,
          approvement,
        },
        { where: { id } }
      );

      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      console.log(e);
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const team = await Team.findOne({
        where: { id },
        include: [
          {
            model: TeamParticipants,
            include: [{ model: Participant }],
          },
          {
            model: EventTeams,
            include: {
              model: Event,
              include: [
                {
                  model: EventTeams,
                  include: [{ model: Team }],
                },
              ],
            },
          },
        ],
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...team.dataValues, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}
module.exports = new TeamController();
