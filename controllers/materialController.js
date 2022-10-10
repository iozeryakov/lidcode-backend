const ApiError = require("../error/ApiError");
const generateJwt = require("../utils/generateJwt");
const { Material, EventMaterials } = require("../models/models");
class MaterialController {
  async create(req, res, next) {
    try {
      const { name, link } = req.body;
      await Material.create({ name, link });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      await Material.destroy({
        where: { id },
      });
      await EventMaterials.destroy({
        where: {
          materialId: null,
        },
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async update(req, res, next) {
    try {
      const { id, name, link } = req.body;
      await Material.update({ name, link }, { where: { id } });
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
      const material = await Material.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...material, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getFree(req, res, next) {
    try {
      const { id } = req.query;
      const material = await Material.findAndCountAll({
        include: [
          {
            model: EventMaterials,
            required: false,
          },
        ],
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({
        rows: material.rows.filter(
          (i) =>
            i.dataValues.event_materials.filter(
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
      const material = await Material.findOne({
        where: { id },
      });
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ ...material.dataValues, token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}
module.exports = new MaterialController();
