import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function deleteTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/trip/:tripId',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;

      try {
        await prisma.participant.deleteMany({
          where: {
            trip_id: tripId,
          },
        });

        await prisma.trip.delete({
          where: {
            id: tripId,
          },
        });

        reply.send({ message: 'Trip deleted successfully' });
      } catch (error) {
        reply.code(500).send({ error: 'Failed to delete the trip' });
      }
    }
  );
}
