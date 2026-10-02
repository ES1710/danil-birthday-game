export type QuizQuestion = {
  id: number;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  image: string;
};

export type PublicQuizQuestion = Omit<QuizQuestion, "correctIndex">;

export const questions: QuizQuestion[] = [
  {
    id: 1,
    text: "Кем Данил хотел стать в детстве?",
    options: ["Космонавтом", "Стоматологом", "Таксистом", "Бизнесменом"],
    correctIndex: 1,
    image: "/images/quiz/01.png",
  },
  {
    id: 2,
    text: "Какой предмет Данил больше всего любил в школе?",
    options: ["Физра", "Химия", "Биология", "Технология"],
    correctIndex: 0,
    image: "/images/quiz/02.png",
  },
  {
    id: 3,
    text: "Какой у Данила любимый музыкант?",
    options: ["Sqwoz Bab", "Oxxxymiron", "Loqiemean", "Michael Jackson"],
    correctIndex: 2,
    image: "/images/quiz/03.png",
  },
  {
    id: 4,
    text: "Какой любимый вид спорта у Данила?",
    options: ["Хоккей", "Футбол", "Баскетбол", "Волейбол"],
    correctIndex: 0,
    image: "/images/quiz/04.png",
  },
  {
    id: 5,
    text: "Какое любимое блюдо у Данила?",
    options: ["Пельмени", "Паста карбонара", "Лагман", "Жареная курица"],
    correctIndex: 3,
    image: "/images/quiz/05.png",
  },
  {
    id: 6,
    text: "Какой мультфильм Данил готов пересматривать несколько раз?",
    options: ["Рататуй", "Девять", "Тачки", "Гринч"],
    correctIndex: 1,
    image: "/images/quiz/06.png",
  },
  {
    id: 7,
    text: "Какую компьютерную игру Данил запускает чаще остальных?",
    options: ["Dota 2", "CS2", "Minecraft", "Valorant"],
    correctIndex: 3,
    image: "/images/quiz/07.png",
  },
  {
    id: 8,
    text: "Какой вид отдыха Данил предпочитает?",
    options: ["Уехать в лес", "Поиграть в компьютер", "Погулять по городу", "Сходить в кино"],
    correctIndex: 0,
    image: "/images/quiz/08.png",
  },
  {
    id: 9,
    text: "Что сильнее всего раздражает Данила?",
    options: [
      "Дождливая погода и холод",
      "Голод и немытая посуда",
      "Вонь и грязь",
      "Непунктуальные люди",
    ],
    correctIndex: 1,
    image: "/images/quiz/09.png",
  },
  {
    id: 10,
    text: "Где состоялась самая запоминающаяся поездка Данила?",
    options: ["В Москве", "В Миассе", "В Питере", "В Кусе"],
    correctIndex: 3,
    image: "/images/quiz/10.png",
  },
  {
    id: 11,
    text: "Какую покупку Данил совершил наиболее спонтанно?",
    options: ["Машина", "Компьютер", "Кальян", "Кружка"],
    correctIndex: 0,
    image: "/images/quiz/11.png",
  },
  {
    id: 12,
    text: "Каким героем фильма был бы Данил?",
    options: ["Джек Воробей", "Дэдпул", "Шерлок Холмс", "Бэтмен"],
    correctIndex: 1,
    image: "/images/quiz/12.png",
  },
  {
    id: 13,
    text: "Какой гараж мечты у Данила?",
    options: [
      "Nissan GTR, Ford Raptor, BMW 7 Series",
      "Toyota Supra, Ram TRX, Mercedes-Maybach GLS 680",
      "BMW Z4, Chevrolet Silverado, Audi A8",
      "Chevrolet Corvette, Jeep Wrangler, Lexus LS",
    ],
    correctIndex: 1,
    image: "/images/quiz/13.png",
  },
  {
    id: 14,
    text: "На что Данил потратит неожиданно найденные 100 000 рублей?",
    options: ["Положит на вклад", "На вещи", "На благотворительность", "На путешествие"],
    correctIndex: 3,
    image: "/images/quiz/14.png",
  },
  {
    id: 15,
    text: "В какой стране Данил мечтал бы пожить?",
    options: ["Япония", "США", "Германия", "Таиланд"],
    correctIndex: 0,
    image: "/images/quiz/15.png",
  },
];

export const publicQuestions: PublicQuizQuestion[] = questions.map(
  ({ id, text, options, image }) => ({ id, text, options, image }),
);
