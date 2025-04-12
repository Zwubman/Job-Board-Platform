import nodemailer from "nodemailer";

export const sendMailNotification = async(
    userEMail,
    firstName,
    middleName,
    lastName,
    applicationStatus,
) =>{
    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEMail,
            subject: "Acceptance Confirmation!",
            htm: ``
        }

        transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to: ${userEMail}`);
    }catch(error){
        console.log("Error sneding email: ", error);
    }
}