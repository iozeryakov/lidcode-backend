const uuid = require("uuid");
const path = require("path");
const { Op, literal } = require("sequelize");
const generateJwt = require("../utils/generateJwt");
const fs = require("fs");
const ApiError = require("../error/ApiError");
const { Sponsor, EventSponsors } = require("../models/models");
class SponsorController {
  async create(req, res, next) {
    try {
      const { name, link } = req.body;
      const { image } = req.files;

      let fileName = uuid.v4() + ".jpg";
      image.mv(path.resolve(__dirname, "..", "static", fileName));

      await Sponsor.create({ name, image: fileName, link });
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
      const sponsor = await Sponsor.findOne({ where: { id } });
      let fileName;
      if (image !== sponsor.image) {
        fileName = uuid.v4() + ".jpg";
        image.mv(path.resolve(__dirname, "..", "static", fileName));
        fs.unlinkSync(path.resolve(__dirname, "..", "static", sponsor.image));
      } else {
        fileName = image;
      }
      await Sponsor.update({ name, image: fileName, link }, { where: { id } });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      const sponsor = await Sponsor.findOne({
        where: { id },
      });

      await Sponsor.destroy({
        where: { id },
      });
      fs.unlinkSync(path.resolve(__dirname, "..", "static", sponsor.image));
      await EventSponsors.destroy({
        where: {
          sponsorId: null,
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
      const sponsor = await Sponsor.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...sponsor, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getFree(req, res, next) {
    try {
      const { id } = req.query;
      const sponsor = await Sponsor.findAndCountAll({
        include: [
          {
            model: EventSponsors,
            required: false,
          },
        ],
      });
      const token = generateJwt(req.user.id, req.user.login);

      return res.json({
        rows: sponsor.rows.filter(
          (i) =>
            i.dataValues.event_sponsors.filter(
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
      const sponsor = await Sponsor.findOne({
        where: { id },
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...sponsor.dataValues, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}
module.exports = new SponsorController();
