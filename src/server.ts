import express from 'express';
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';

const app = express();
const PORT = process.env.PORT || 5050;
const prisma = new PrismaClient();

app.use(express.json());

// CREATE A USER
app.post('/users', async (req, res) => {
  const { username, displayName, email } = req.body;

  const user = await prisma.user.create({
    data: {
      username,
      displayName,
      email,
    },
  })

  res.json({
    status: 'success',
    message: 'User created successfully!',
    data: user
  });
})

// READ ALL USERS
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.send({
    status: 'success',
    message: 'Users data retreived successfully!',
    data: users
  });
})

// READ A USER
app.get('/users/:id', async (req, res) => {
  const id = req.params.id;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(id)
    }
  })

  res.send({
    status: 'success',
    message: `User data retreived successfully!`,
    data: user
  });
})

// UPDATE A USER
app.put('/users/:id', async (req, res) => {
  const id = req.params.id;
  const { username, displayName, email } = req.body;
  const user = await prisma.user.update({
    where: {
      id: Number(id)
    },
    data: {
      username, 
      displayName, 
      email
    }
  })

  res.send({
    status: 'success',
    message: `User ${id} updated successfully`,
    data: user
  });
})

// DELETE A USER
app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;

 await prisma.user.delete({
    where: {
      id: Number(id)
    }
  })

  res.send({
    status: 'success',
    message: `User ${id} successfully deleted`,
  });
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});