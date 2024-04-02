const express = require("express");
const fetchuser = require("../middleware/fetchUsers");
const Notes = require("../modals/Notes");
const { body, validationResult } = require("express-validator");
const router = express.Router();

async function getNextSequenceValue(sequenceName) {
  var sequenceDocument = await Notes.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { returnOriginal: false, upsert: true }
  );
  return sequenceDocument.value.sequence_value;
}

router.post(
  "/addNotes",
  fetchuser,
  [
    body("title", "Please Enter The Title").isLength({ min: 3 }),
    body(
      "description",
      "Your Descriptiion Should be more then 5 charcters length"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    console.log("-=-=--------------------------------");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ errors_status: true, message: errors.array() });
    }
    try {
      const { title, description, tag } = req.body;
      Notes.create({
        user_id: req.user.id,
        title: title,
        description: description,
        tag: tag ? tag : "",
      }).then(() => {
        res.send({ errors_status: false, message: "Notes Added Successfully" });
      });
    } catch (error) {
      res.send(error);
    }
  }
);

router.get("/getnotes", fetchuser, async (req, res) => {
  const notes = await Notes.find({ user_id: req.user.id }, { __v: 0 });
  res.send({ errors_status: false, data: notes });
});

router.post(
  "/updatenotes",
  fetchuser,
  [
    body(" note_id", "Please Enter note id").isLength({ min: 0 }),
    body("title", "Please Enter The Title").isLength({ min: 3 }),
    body(
      "description",
      "Your Descriptiion Should be more then 5 charcters length"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ errors_status: true, message: errors.array() });
    }
    const notes = await Notes.findById(req.body.note_id);
    if (!notes) {
      res.send("no Notes Found");
    }
    console.log("-=-=-=-=-=--=", notes.user_id);
    if (notes.user_id.toString() === req.user.id) {
      await Notes.updateOne(
        { _id: req.body.note_id },
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
            tag: req.body.tag,
            date: Date.now(),
          },
        }
      )
        .then(() => {
          res.send("SUCCESSs");
          console.log("------success-----");
        })
        .catch((error) => console.log("-------error-----", error));
    } else {
      res.send("note not matched with this user");
    }
  }
);

module.exports = router;
