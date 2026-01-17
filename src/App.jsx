import React from "react";
import Questions from "./components/Quiz";
import he from "he";
import { nanoid } from "nanoid";

export default function App() {
  const [clicked, setClicked] = React.useState(false);
  const [answerArray, setAnswerArray] = React.useState([]);
  const [playerScore, setPlayerScore] = React.useState(0);
  const [gameFinished, setGameFinished] = React.useState(false);
  const [restart, setRestart] = React.useState(false);

  function togglePage() {
    setClicked((oldState) => !oldState);
  }

  function handleChange(value, id) {
    setAnswerArray((oldArray) =>
      oldArray.map((question) =>
        question.id === id ? { ...question, selectedAnswer: value } : question
      )
    );
  }

  function checkScore() {
    let score = 0;
    answerArray.map((component) => {
      if (component.selectedAnswer === component.correctAnswer) {
        score++;
      }
    });
    setPlayerScore(score);
    checkCompletion();
  }

  function checkCompletion() {
    if (answerArray.every((answer) => answer.selectedAnswer)) {
      setGameFinished(true);
    }
  }

  function restartGame() {
    setPlayerScore(0);
    setRestart(!restart);
    setGameFinished(false);
  }

  React.useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API call failed with status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const quizResults = data.results.map((quiz) => {
          let answerArr = [...quiz.incorrect_answers, quiz.correct_answer];

          answerArr.sort(() => Math.random() - 0.5);

          return {
            id: nanoid(),
            question: he.decode(quiz.question),
            correctAnswer: quiz.correct_answer,
            incorrectAnswer: quiz.incorrect_answers,
            allAnswers: answerArr,
            selectedAnswer: "",
          };
        });
        setAnswerArray(quizResults);
      });
  }, [restart]);

  const landingPage = (
    <div className="landing--page">
      <h1 className="landing--header">welcome to Quizzical</h1>
      <p className="landing--text">Are you ready to test your knowledge?</p>
      <button onClick={togglePage} className="landing--button">
        Start Quiz
      </button>
    </div>
  );

  const endMessage = (
    <p className="end--msg">
      Your score is <strong>{playerScore}</strong> out of 5
    </p>
  );

  const startBtn = (
    <button onClick={checkScore} className="check--answers">
      Check Answers
    </button>
  );

  const restartQuiz = (
    <button onClick={restartGame} className="check--answers">
      Restart Quiz
    </button>
  );

  const questionElements = answerArray.map((question) => (
    <Questions
      key={question.id}
      question={question}
      handleChange={handleChange}
      gameFinished={gameFinished}
    />
  ));

  const quizElement = (
    <>
      {questionElements}
      <div className="footer">
        {gameFinished ? endMessage : null}
        {gameFinished ? restartQuiz : startBtn}
      </div>
    </>
  );
  return <div>{!clicked ? landingPage : quizElement}</div>;
}
