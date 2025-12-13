// REGISTER STUDENT
app.post("/api/student/register", async (req, res) => {
  try {
    const {
      regNo,
      name,
      parentMobile,
      studentMobile,
      roomNo,
      dept,
      password,
      floor,
      warden
    } = req.body

    // VALIDATIONS
    if (!regNo || !name || !password || !dept || !floor || !warden) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (!/^[A-Z]{2,5}-[A-Z]$/.test(dept)) {
      return res.status(400).json({ message: "Dept must be like CSE-D" })
    }

    if (parentMobile.length !== 10 || studentMobile.length !== 10) {
      return res.status(400).json({ message: "Mobile must be 10 digits" })
    }

    const regUpper = regNo.toUpperCase()

    const exists = await User.findOne({ regNo: regUpper })
    if (exists) {
      return res.status(400).json({ message: "Already Registered!" })
    }

    const hash = await bcrypt.hash(password, 10)

    // ✅ SAVE EVERYTHING (INCLUDING FLOOR & WARDEN)
    await User.create({
      regNo: regUpper,
      name,
      parentMobile,
      studentMobile,
      roomNo,
      dept,
      floor,
      warden,
      passwordHash: hash,
      role: "student"
    })

    res.json({ message: "Student Registered Successfully" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Register Failed" })
  }
})
