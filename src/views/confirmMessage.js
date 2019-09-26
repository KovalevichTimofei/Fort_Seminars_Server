export default function (data) {
  const {
    name, surname, email, seminar,
  } = data;
  const href = `http://localhost:3000/listeners/register/confirm?name=${name}&surname=${surname}&email=${email}&seminar=${seminar.id}`;
  return `<html class="container">
            <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap" rel="stylesheet">
            <div class="text-container">
                <h2>${name} ${surname}!</h2>
                <div>Вы зарегистрировались на семинар "${seminar.title}"</div>
                <div>Для подтверждения регистрации перейдите по следующей ссылке:</div>
                <br/>
                <a href=${href}>Ссылка для подтверждения</a>
            </div>
            <style>
                .container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .text-container {
                    border-radius: 16px;
                    font: 1.2em 'Roboto Condensed', sans-serif;
                    text-align: center;
                }
                .text-container > div {
                    line-height: 1em;
                    margin: 10px;
                }
            </style>
        </html>`;
}
