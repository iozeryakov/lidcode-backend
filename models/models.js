const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Event = sequelize.define("event", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  isHidden: { type: DataTypes.BOOLEAN, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  numberOfParticipants: { type: DataTypes.INTEGER, allowNull: false },
  numberComands: { type: DataTypes.INTEGER, allowNull: false },
  regulations: { type: DataTypes.TEXT, allowNull: false },
  results: { type: DataTypes.TEXT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  dateRegister: { type: DataTypes.DATE, allowNull: false },
  dateCloseRegister: { type: DataTypes.DATE, allowNull: false },
  dateStart: { type: DataTypes.DATE, allowNull: false },
  datEnd: { type: DataTypes.DATE, allowNull: false },
  timePublicationAdditionalMaterial: { type: DataTypes.DATE, allowNull: false },
});

const Sponsor = sequelize.define("sponsor", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING, allowNull: false },
});

const Organizer = sequelize.define("organizer", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING, allowNull: false },
});

const Team = sequelize.define("team", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  approvement: { type: DataTypes.STRING, defaultValue: "Ожидает" },
  CoachFaceId: { type: DataTypes.INTEGER, allowNull: false },
  ContactFaceId: { type: DataTypes.INTEGER, allowNull: false },
});

const Material = sequelize.define("material", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING, allowNull: false },
});

const Participant = sequelize.define("participant", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  emailAdress: { type: DataTypes.STRING, allowNull: false },
  phoneNumbers: { type: DataTypes.STRING, allowNull: false },
  organization: { type: DataTypes.STRING, allowNull: false },
  universityFaculty: { type: DataTypes.STRING, allowNull: false },
  universityCourse: { type: DataTypes.STRING, allowNull: false },
});

const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

const EventSponsors = sequelize.define("event_sponsors", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const EventOrganizers = sequelize.define("event_organizers", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const EventMaterials = sequelize.define("event_materials", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const EventTeams = sequelize.define("event_teams", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const TeamParticipants = sequelize.define("team_participants", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

Event.hasMany(EventMaterials);
EventMaterials.belongsTo(Event);

Material.hasMany(EventMaterials);
EventMaterials.belongsTo(Material);

Event.hasMany(EventOrganizers);
EventOrganizers.belongsTo(Event);

Organizer.hasMany(EventOrganizers);
EventOrganizers.belongsTo(Organizer);

Event.hasMany(EventSponsors);
EventSponsors.belongsTo(Event);

Sponsor.hasMany(EventSponsors);
EventSponsors.belongsTo(Sponsor);

Event.hasMany(EventTeams);
EventTeams.belongsTo(Event);

Team.hasMany(EventTeams);
EventTeams.belongsTo(Team);

Team.hasMany(TeamParticipants);
TeamParticipants.belongsTo(Team);

Participant.hasMany(TeamParticipants);
TeamParticipants.belongsTo(Participant);

module.exports = {
  Event,
  Sponsor,
  Material,
  Organizer,
  EventMaterials,
  EventSponsors,
  EventOrganizers,
  EventTeams,
  Team,
  TeamParticipants,
  Participant,
  User,
};
