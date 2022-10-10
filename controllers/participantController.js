const { literal } = require("sequelize");
const ApiError = require("../error/ApiError");
const generateJwt = require("../utils/generateJwt");
const { Participant, TeamParticipants, Team } = require("../models/models");
class ParticipantController {
  async create(req, res, next) {
    try {
      const {
        name,
        emailAdress,
        phoneNumbers,
        organization,
        universityFaculty,
        universityCourse,
      } = req.body;
      await Participant.create({
        name,
        emailAdress,
        phoneNumbers,
        organization,
        universityFaculty,
        universityCourse,
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async update(req, res, next) {
    try {
      const {
        id,
        name,
        emailAdress,
        phoneNumbers,
        organization,
        universityFaculty,
        universityCourse,
      } = req.body;
      await Participant.update(
        {
          name,
          emailAdress,
          phoneNumbers,
          organization,
          universityFaculty,
          universityCourse,
        },
        { where: { id } }
      );
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
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
      const participant = await Participant.findAndCountAll({
        include: { model: TeamParticipants, include: { model: Team } },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...participant, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getFree(req, res, next) {
    try {
      const participant = await Participant.findAndCountAll({
        include: [
          {
            model: TeamParticipants,
            required: false,
          },
        ],
        group: ["participant.id", "team_participants.id"],
        having: literal('"team_participants"."id" IS NULL'),
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...participant, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      const participant = await Participant.findOne({
        where: { id },
        include: [{ model: TeamParticipants }],
      });
      if (participant.dataValues.team_participants.length !== 0) {
        return next(
          ApiError.badRequest(
            "Учасник '" + participant.dataValues.name + "' состоит в команде."
          )
        );
      }
      await Participant.destroy({
        where: { id },
      });
      await TeamParticipants.destroy({
        where: { participantId: null },
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const participant = await Participant.findOne({
        where: { id },
        include: { model: TeamParticipants, include: { model: Team } },
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...participant.dataValues, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new ParticipantController();
