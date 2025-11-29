import nodemailer from "nodemailer"

class MailService {
    transport;
    constructor(){
        //connect
        try{
            let config = {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                service: process.env.SMTP_SERVICE,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PWD
                },
            }

            if( process.env.SMTP_SERVICE === 'gmail'){
                config['service'] = 'gmail'
            }

            this.transport = nodemailer.createTransport(config);
        }catch(exception){
            console.log("Error connecting Mail server..");
            throw exception;
        }
    }

    sendEmail = async(to, sub, message, attachments)=>{
        try{
            const ack = await this.transport.sendMail({
                to: to,
                from: process.env.SMTP_FROM,
                subject: sub,
                html: message,
            })
            console.log(ack)
            return ack;
        }catch(exception){
            console.log("Error sending email...", exception)
            throw exception
        }
    }
}

const mailSvc = new MailService();
export default mailSvc