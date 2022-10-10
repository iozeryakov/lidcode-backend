const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const ApiError = require("../error/ApiError");
const generateJwt = require("../utils/generateJwt");
const { Organizer, EventOrganizers } = require("../models/models");
class OrganizerController {
  async create(req, res, next) {
    try {
      const { name, link } = req.body;
      const { image } = req.files;

      let fileName = uuid.v4() + ".jpg";
      image.mv(path.resolve(__dirname, "..", "static", fileName));

      await Organizer.create({ name, image: fileName, link });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async update(req, res, next) {
    try {
      const { id, name, link } = req.body;
      let { image } = req.body;
      if (!image) image = req.files.image;
      const organizer = await Organizer.findOne({ where: { id } });
      let fileName;
      if (image !== organizer.image) {
        fileName = uuid.v4() + ".jpg";
        image.mv(path.resolve(__dirname, "..", "static", fileName));
        fs.unlinkSync(path.resolve(__dirname, "..", "static", organizer.image));
      } else {
        fileName = image;
      }
      await Organizer.update(
        { name, image: fileName, link },
        { where: { id } }
      );
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      const org = await Organizer.findOne({ where: { id } });
      await Organizer.destroy({
        where: { id },
      });
      fs.unlinkSync(path.resolve(__dirname, "..", "static", org.image));
      await EventOrganizers.destroy({
        where: {
          organizerId: null,
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
      const organizer = await Organizer.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...organizer, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getFree(req, res, next) {
    try {
      const { id } = req.query;
      const organizer = await Organizer.findAndCountAll({
        include: [
          {
            model: EventOrganizers,
            required: false,
          },
        ],
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({
        rows: organizer.rows.filter(
          (i) =>
            i.dataValues.event_organizers.filter(
              (j) => j.dataValues.eventId == id
            ).length === 0
        ),
        token,
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const organizer = await Organizer.findOne({
        where: { id },
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...organizer.dataValues, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}
module.exports = new OrganizerController();
