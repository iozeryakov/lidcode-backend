const bcrypt = require("bcrypt");
const ApiError = require("../error/ApiError");
const { User } = require("../models/models");
const generateJwt = require("../utils/generateJwt");

class UserController {
  async registration(req, res, next) {
    try {
      const { login, password } = req.body;
      if (!login || !password) {
        return next(ApiError.badRequest("Некоректный email или password"));
      }
      const candidate = await User.findOne({ where: { login } });
      if (candidate) {
        return next(
          ApiError.badRequest("Пользователь с таким login уже существует")
        );
      }
      const hashPassword = await bcrypt.hash(password, 5);
      const user = await User.create({ login, password: hashPassword });
      const token = generateJwt(user.id, user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async login(req, res, next) {
    try {
      const { login, password } = req.body;
      const user = await User.findOne({ where: { login } });
      if (!user) {
        return next(ApiError.internal("Пользователь не найден"));
      }
      let comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal("Пароль не верный"));
      }
      const token = generateJwt(user.id, user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async check(req, res, next) {
    try {
      const token = generateJwt(req.user.id, req.user.login);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}
module.exports = new UserController();
