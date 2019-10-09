'use strict';

const AWS = require('aws-sdk')
AWS.config.update({
  region: process.env.AWS_REGION
})
const SNS = new AWS.SNS()
const converter = AWS.DynamoDB.Converter
const moment = require('moment')
moment.locale('pt-br')

module.exports.listen = async event => {
  const snsPromises = []
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const reserva = converter.unmarshall(record.dynamodb.NewImage)
      console.log(`Reserva efetuada: o usuário ${reserva.user.name} (${reserva.user.email}) agendou um horário em: ${moment.unix(reserva.date).format('LLLL')}`)
      snsPromises.push(SNS.publish({
        TopicArn: process.env.SNS_NOTIFICATIONS_TOPIC,
        Message: `Reserva efetuada: o usuário ${reserva.user.name} (${reserva.user.email}) agendou um horário em: ${moment.unix(reserva.date).format('LLLL')}`
      }).promise())
    }
  }
  
  await Promise.all(snsPromises)
  console.log('Mensagem(ns) enviada(s) com sucesso!')
  return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};