import fastify from 'fastify';
import { createTrip } from './routes/create-trip';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { confirmTrip } from './routes/confirm';
import cors from '@fastify/cors';
import { deleteTrip } from './routes/delete-trip';
import { getTrips } from './routes/get-trips';

const app = fastify();

app.register(cors, {
  origin: '*',
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(deleteTrip);
app.register(getTrips);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running on http://localhost:3333');
});
