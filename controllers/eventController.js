const uuid = require("uuid");
const sequelize = require("../db");
const path = require("path");
const fs = require("fs");
const generateJwt = require("../utils/generateJwt");
const ApiError = require("../error/ApiError");
const {
  Event,
  EventTeams,
  Team,
  EventSponsors,
  Sponsor,
  EventOrganizers,
  Organizer,
  EventMaterials,
  Material,
  TeamParticipants,
} = require("../models/models");
class EventController {
  async create(req, res, next) {
    try {
      const {
        name,
        isHidden,
        description,
        numberOfParticipants,
        numberComands,
        regulations,
        results,
        dateRegister,
        dateCloseRegister,
        dateStart,
        datEnd,
        timePublicationAdditionalMaterial,
      } = req.body;
      const { image } = req.files;

      let fileName = uuid.v4() + ".jpg";
      image.mv(path.resolve(__dirname, "..", "static", fileName));
      await Event.create({
        name,
        isHidden,
        description,
        numberOfParticipants,
        numberComands,
        regulations,
        results,
        image: fileName,
        dateRegister,
        dateCloseRegister,
        dateStart,
        datEnd,
        timePublicationAdditionalMaterial,
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      const event = await Event.findOne({
        where: { id },
      });
      await Event.destroy({
        where: { id },
      });
      fs.unlinkSync(path.resolve(__dirname, "..", "static", event.image));
      await EventTeams.destroy({
        where: {
          eventId: null,
        },
      });
      await EventSponsors.destroy({
        where: {
          eventId: null,
        },
      });
      await EventOrganizers.destroy({
        where: {
          eventId: null,
        },
      });
      await EventMaterials.destroy({
        where: {
          eventId: null,
        },
      });
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
      const event = await Event.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      let date = new Date();
      date.setHours(date.getHours() + 3);
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...event, token, dateNow: date });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOpen(req, res, next) {
    try {
      let { page } = req.query;
      page = page || 1;
      const limit = 10;
      let offset = limit * page - limit;
      const event = await Event.findAndCountAll({
        order: [["createdAt", "DESC"]],
        where: { isHidden: "false" },
        limit,
        offset,
      });
      let date = new Date();
      date.setHours(date.getHours() + 3);

      return res.json({ ...event, dateNow: date });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async update(req, res, next) {
    try {
      const {
        id,
        name,
        isHidden,
        description,
        numberOfParticipants,
        numberComands,
        regulations,
        results,
        dateRegister,
        dateCloseRegister,
        dateStart,
        datEnd,
        timePublicationAdditionalMaterial,
        teams,
        sponsors,
        organizers,
        materials,
      } = req.body;
      let { image } = req.body;
      if (!image) image = req.files.image;
      const event = await Event.findOne({ where: { id } });
      let fileName;
      if (image !== event.image) {
        fileName = uuid.v4() + ".jpg";
        image.mv(path.resolve(__dirname, "..", "static", fileName));
        fs.unlinkSync(path.resolve(__dirname, "..", "static", event.image));
      } else {
        fileName = image;
      }
      const team = JSON.parse(teams);
      const sponsor = JSON.parse(sponsors);
      const organizer = JSON.parse(organizers);
      const material = JSON.parse(materials);
      const teamNow = await EventTeams.findAll({
        where: { eventId: id },
      });
      const sponsorNow = await EventSponsors.findAll({
        where: { eventId: id },
      });
      const organizerNow = await EventOrganizers.findAll({
        where: { eventId: id },
      });
      const materialNow = await EventMaterials.findAll({
        where: { eventId: id },
      });

      for (const i of teamNow) {
        if (!team.includes(i.teamId)) {
          await EventTeams.destroy({
            where: { id: i.id },
          });
        }
      }
      for (const i of sponsorNow) {
        if (!sponsor.includes(i.sponsorId)) {
          await EventSponsors.destroy({
            where: { id: i.id },
          });
        }
      }
      for (const i of organizerNow) {
        if (!organizer.includes(i.organizerId)) {
          await EventOrganizers.destroy({
            where: { id: i.id },
          });
        }
      }
      for (const i of materialNow) {
        if (!material.includes(i.materialId)) {
          await EventMaterials.destroy({
            where: { id: i.id },
          });
        }
      }
      for (const i of team) {
        let flag = true;
        for (const j of teamNow) {
          if (j.teamId === i) {
            flag = false;
          }
        }
        if (flag)
          await EventTeams.create({
            teamId: i,
            eventId: id,
          });
      }
      for (const i of sponsor) {
        let flag = true;
        for (const j of sponsorNow) {
          if (j.sponsorId === i) {
            flag = false;
          }
        }
        if (flag)
          await EventSponsors.create({
            sponsorId: i,
            eventId: id,
          });
      }
      for (const i of organizer) {
        let flag = true;
        for (const j of organizerNow) {
          if (j.organizerId === i) {
            flag = false;
          }
        }
        if (flag)
          await EventOrganizers.create({
            organizerId: i,
            eventId: id,
          });
      }
      for (const i of material) {
        let flag = true;
        for (const j of materialNow) {
          if (j.materialId === i) {
            flag = false;
          }
        }
        if (flag)
          await EventMaterials.create({
            materialId: i,
            eventId: id,
          });
      }
      await Event.update(
        {
          name,
          isHidden,
          description,
          numberOfParticipants,
          numberComands,
          regulations,
          results,
          dateRegister,
          dateCloseRegister,
          dateStart,
          datEnd,
          image: fileName,
          timePublicationAdditionalMaterial,
        },
        { where: { id } }
      );
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findOne({
        where: { id },
        include: [
          {
            model: EventTeams,
            include: [{ model: Team, include: [{ model: TeamParticipants }] }],
          },
          {
            model: EventSponsors,
            include: [{ model: Sponsor }],
          },
          {
            model: EventOrganizers,
            include: [{ model: Organizer }],
          },
          {
            model: EventMaterials,
            include: [{ model: Material }],
          },
        ],
      });
      let date = new Date();
      date.setHours(date.getHours() + 3);

      return res.json({ ...event.dataValues, dateNow: date });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}
module.exports = new EventController();
