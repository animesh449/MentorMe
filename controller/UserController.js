const { User, Mentee, Mentor } = require("../modals/mongoose-model");
const bcrypt = require("bcrypt");

exports.createMentor = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    user = new Mentor({
      name,
      email,
      password,
      account_type: "mentor",
    });
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_TOKEN,
      { expiresIn: "7 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};
exports.createMentee = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    user = new Mentee({
      name,
      email,
      password,
      account_type: "mentee",
    });
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_TOKEN,
      { expiresIn: "7 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User doesnot exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect credential" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_TOKEN,
      { expiresIn: "7 days" },
      (err, token) => {
        if (err) throw err;
        return res.json({ token });
      }
    );
  } catch (error) {
    return res.status(400).send({ error: "Some error occured" });
  }
};

// exports.userLogout = async (req, res) => {
//   try {
//     req.user.tokens = req.user.tokens.filter((tokens) => {
//       return tokens.token != req.token;
//     });
//     await req.user.save();
//     return res.status(200).send({success: "User logged out successfully"});
//   } catch (e) {
//     return res.status(400).send({error: "Some error occured during the operation "});
//   }
// };

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "No user found with such Id" });
    }
    res.status(200).json({ msg: "User deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Some error occured during delete user operation" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select(
      "-password -updatedAt -createdAt"
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "-password -updatedAt -createdAt"
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getUserByName = async (req, res) => {
  const { name } = req.params;
  User.find({ name }).then((users) => res.status(200).send(users));
};
