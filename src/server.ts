import express from 'express';
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5050;
const prisma = new PrismaClient();

app.use(express.json());

const accesValidation = (req: Request, res: Response, next: NextFunction) => {
  const { authorization }: string = req.headers;

  if(!authorization){
    return res.status(401).json({
      status: 'error',
      message: 'Access token not found!'
    });
  }

  const token: string = authorization.split(' ')[1];
  const secret: string = process.env.JWT_SECRET!;

  try {
    const jwtDecode: any = jwt.verify(token, secret);

    if(typeof jwtDecode === 'object'){
      req.userData = jwtDecode;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid access token!'
    });
  }
}

// REGISTER
app.post('/auth/register', async (req: Request, res: Response) => {
  const { username, displayName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      displayName,
      email,
      password: hashedPassword
    },
  })

  res.json({
    status: 'success',
    message: 'User created successfully!',
    data: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email
    }
  });
})

// LOGIN
app.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if(!user){
    return res.status(401).json({
      status: 'error',
      message: 'User not found!'
    });
  }

  if(!user?.password) { 
    return res.status(401).json({
      status: 'error',
      message: 'Password not set!'
    });
  }

  const isValidPassword = await bcrypt.compare(password, user?.password);

  if (isValidPassword){
    const userData = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email
    }
    const secret = process.env.JWT_SECRET
    const expiresIn = process.env.JWT_EXPIRATION
    const token = jwt.sign(userData, secret, {expiresIn: expiresIn});

    res.json({
      status: 'success',
      message: 'User logged in successfully!',
      data: {
        user: userData,
        token
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Invalid credentials!'
    });
  }
})

// LOGOUT
app.post('/auth/logout', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'User logged out successfully!'
  });
})

// CREATE A USER
app.post('/users', async (req: Request, res: Response) => {
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
    data: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email
    }
  });
})

// READ ALL USERS
app.get('/users', accesValidation,  async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true
    }
  });
  res.json({
    status: 'success',
    message: 'Users data retrieved successfully!',
    data: users
  });
})

// READ A USER
app.get('/users/:id', accesValidation, async (req: Request, res: Response) => {
  const id = req.params.id;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(id)
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true
    }
  })
  
  if(!user){
    return res.status(404).json({
      status: 'error',
      message: `User not found!`
    });
  }

  res.json({
    status: 'success',
    message: `User data retrieved successfully!`,
    data: user
  });
})

// UPDATE A USER
app.put('/users/:id', accesValidation, async (req: Request, res: Response) => {
  const id = req.params.id;
  const { username, displayName, email } = req.body;

  const checkUser = await prisma.user.findUnique({
    where: {
      id: Number(id)
    }
  })

  if(!checkUser){
    return res.status(404).json({
      status: 'error',
      message: `User not found!`
    });
  }

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

  res.json({
    status: 'success',
    message: `User ${id} updated successfully`,
    data: user
  });
})

// DELETE A USER
app.delete('/users/:id', accesValidation, async (req: Request, res: Response) => {
  const id = req.params.id;

 await prisma.user.delete({
    where: {
      id: Number(id)
    }
  })

  res.json({
    status: 'success',
    message: `User ${id} successfully deleted`,
  });
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});