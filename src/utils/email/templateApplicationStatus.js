export const templateApplicationStatus = (firstName, status) => {
  let message;
  if (status === "Accepted") {
    message = `<p>Dear <strong>${firstName}</strong>,</p><p>Congratulations! We are pleased to inform you that you have been accepted for the position. We look forward to having you on our team.</p>`;
  } else if (status === "Rejected") {
    message = `<p>Dear <strong>${firstName}</strong>,</p><p>We appreciate your interest in the position. Unfortunately, we have decided to move forward with other candidates at this time. We wish you all the best in your career.</p>`;
  } else {
    message = `<p>Dear <strong>${firstName}</strong>,</p><p>Your application status is currently under review. We will get back to you soon with an update.</p>`;
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Application Response</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #0073e6;
            color: white;
            padding: 10px;
            border-radius: 10px 10px 0 0;
            font-size: 20px;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            color: #333;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">Application Status</div>
        <div class="content" id="emailContent">
            <p id="message">${message}</p>
        </div>
        <div class="footer">Best regards,<br>HR Team</div>
    </div>
</body>
</html>
`;
};
