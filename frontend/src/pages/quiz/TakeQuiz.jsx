import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizData } from '../../context/QuizContext';
import toast from 'react-hot-toast';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchQuiz, currentQuiz, submitQuiz } = QuizData();
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    fetchQuiz(id);
  }, [id]);

  useEffect(() => {
    if (currentQuiz) {
      setAnswers(new Array(currentQuiz.questions.length).fill(null));
    }
  }, [currentQuiz]);

  const handleAnswerChange = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await submitQuiz(id, answers);
      toast.success(`Quiz submitted! Your score: ${result.score}/${result.totalQuestions}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit quiz');
    }
  };

  if (!currentQuiz) return <div>Loading...</div>;

  return (
    <div className="take-quiz">
      <h2>{currentQuiz.title}</h2>
      <form onSubmit={handleSubmit}>
        {currentQuiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="question">
            <p>{question.question}</p>
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex}>
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={optionIndex}
                  checked={answers[questionIndex] === optionIndex}
                  onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                  required
                />
                {option}
              </label>
            ))}
          </div>
        ))}
        <button type="submit">Submit Quiz</button>
      </form>
    </div>
  );
};

export default TakeQuiz;
