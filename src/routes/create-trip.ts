import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import dayjs from 'dayjs';
import { getMailClient } from '../lib/mail';
import nodemailer from 'nodemailer';

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips',
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
          emails_to_invite: z.array(z.string().email()),
        }),
      },
    },
    async (request) => {
      const {
        destination,
        starts_at,
        ends_at,
        owner_name,
        owner_email,
        emails_to_invite,
      } = request.body;

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error('Invalid trip starts date');
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error('Invalid trip ends date');
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          participants: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emails_to_invite.map((email) => ({
                  email,
                })),
              ],
            },
          },
        },
      });

      const mail = await getMailClient();

      const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`;

      const message = await mail.sendMail({
        from: {
          name: 'Equipe planner',
          address: 'oi@planner.com',
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: 'Sua viagem foi criada!',
        html: `<a href="${confirmationLink}">Confirme sua viagem</a>`,
      });

      console.log(nodemailer.getTestMessageUrl(message), 'message');

      return {
        tripId: trip.id,
      };
    }
  );
}
