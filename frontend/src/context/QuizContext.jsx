import { createContext, useContext, useState } from "react";
import axios from "axios";
import { server } from "../main";

const QuizContext = createContext();

export const QuizContextProvider = ({ children }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);

  async function fetchQuizzes() {
    try {
      const { data } = await axios.get(`${server}/api/quiz/all`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setQuizzes(data.quizzes);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchQuiz(id) {
    try {
      const { data } = await axios.get(`${server}/api/quiz/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setCurrentQuiz(data.quiz);
    } catch (error) {
      console.log(error);
    }
  }

  async function createQuiz(quizData) {
    try {
      const { data } = await axios.post(`${server}/api/quiz/new`, quizData, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async function submitQuiz(id, answers) {
    try {
      const { data } = await axios.post(`${server}/api/quiz/${id}/submit`, { answers }, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        currentQuiz,
        fetchQuizzes,
        fetchQuiz,
        createQuiz,
        submitQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const QuizData = () => useContext(QuizContext);