import React, { useState } from 'react';
import { QuizData } from '../../context/QuizContext';
import { CourseData } from '../../context/CourseContext';
import toast from 'react-hot-toast';
import './createquiz.css'

const CreateQuiz = () => {
  const { createQuiz } = QuizData();
  const { courses } = CourseData();
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createQuiz({ title, questions, courseId });
      toast.success('Quiz created successfully');
      setTitle('');
      setCourseId('');
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    } catch (error) {
      toast.error('Failed to create quiz');
    }
  };

  return (
    <div className="create-quiz">
      <h2>Create Quiz</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz Title"
          required
        />
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>{course.title}</option>
          ))}
        </select>
        {questions.map((question, index) => (
          <div key={index} className="question">
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              placeholder={`Question ${index + 1}`}
              required
            />
            {question.options.map((option, optionIndex) => (
              <input
                key={optionIndex}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                placeholder={`Option ${optionIndex + 1}`}
                required
              />
            ))}
            <select
              value={question.correctAnswer}
              onChange={(e) => handleQuestionChange(index, 'correctAnswer', parseInt(e.target.value))}
              required
            >
              <option value="">Correct Answer</option>
              {question.options.map((_, optionIndex) => (
                <option key={optionIndex} value={optionIndex}>Option {optionIndex + 1}</option>
              ))}
            </select>
          </div>
        ))}
        <button type="button" onClick={addQuestion}>Add Question</button>
        <button type="submit">Create Quiz</button>
      </form>
    </div>
  );
};

export default CreateQuiz;