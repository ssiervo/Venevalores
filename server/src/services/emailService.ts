import nodemailer from 'nodemailer';
import type { BrokerOrderEmailPayload } from '../types.js';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } =
  process.env;

function createTransport() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

export async function sendBrokerOrderEmail(payload: BrokerOrderEmailPayload) {
  const transport = createTransport();
  const subject = `Orden ${payload.side.toUpperCase()} ${payload.symbol} - ${payload.quantity}`;
  const currencyLabel = payload.requestedCurrency || 'VES';

  const body = `Estimado corredor,\n\nPor medio de la presente solicito ejecutar la siguiente orden en la Bolsa de Valores de Caracas:\n\n` +
    `Titular: ${payload.investorName}\n` +
    `Símbolo: ${payload.symbol}\n` +
    `Sentido: ${payload.side === 'buy' ? 'Compra' : 'Venta'}\n` +
    `Cantidad: ${payload.quantity}\n` +
    `Precio (${currencyLabel}): ${payload.priceVES}\n` +
    `Fecha de ejecución deseada: ${payload.executionDate}\n` +
    (payload.additionalNotes ? `Notas: ${payload.additionalNotes}\n\n` : '\n') +
    `Favor confirmar la ejecución respondiendo a este correo para que el sistema actualice el portafolio simulado.\n\n` +
    `Gracias.`;

  if (!transport) {
    console.info('[email:mock]', { to: payload.brokerEmail, subject, body });
    return { mocked: true };
  }

  const info = await transport.sendMail({
    from: SMTP_USER,
    to: payload.brokerEmail,
    subject,
    text: body,
  });
  return { mocked: false, messageId: info.messageId };
}
