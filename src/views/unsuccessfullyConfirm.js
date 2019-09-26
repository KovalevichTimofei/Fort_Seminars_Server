export default `<html class="container">
                    <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap" rel="stylesheet">
                    <div class="text-container">
                        <div style="font-weight: bold">Произошла ошибка.</div>
                        <div>Попробуйте ещё раз</div>
                    </div>
                    <style>
                        .container {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .text-container {
                            background-color: lightcoral;
                            border: 1px solid brown;
                            border-radius: 16px;
                            color: brown;
                            font: 1.2em 'Roboto Condensed', sans-serif;
                            text-align: center;
                            padding: 20px;
                        }
                        .text-container > div {
                            line-height: 1em;
                            margin: 10px;
                        }
                    </style>
                </html>`;
