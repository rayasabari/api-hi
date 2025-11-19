import app from './app.ts';
import env from './config/env.ts';

const { port } = env;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});