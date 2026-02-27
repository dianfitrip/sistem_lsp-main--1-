const bcrypt = require("bcryptjs");
const { User } = require("../models");

exports.createUser = async (
  {
    username,
    email,
    no_hp,
    id_role
  },
  { transaction }
) => {

  const rawPassword = Math.random().toString(36).slice(-8);
  const password_hash = await bcrypt.hash(rawPassword, 10);

  const user = await User.create({
    username,
    password_hash,
    id_role,
    email,
    no_hp
  }, { transaction });

  return { user };
};