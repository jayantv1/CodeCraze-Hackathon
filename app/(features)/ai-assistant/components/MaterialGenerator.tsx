'use client';

import { useState } from 'react';

interface MaterialGeneratorProps {
  onGenerate: (request: string, materialType: string, params: any) => void;
}

export default function MaterialGenerator({ onGenerate }: MaterialGeneratorProps) {
  const [materialType, setMaterialType] = useState('worksheet');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [numQuestions, setNumQuestions] = useState('');
  const [questionTypes, setQuestionTypes] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleGenerate = () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    const request = `Create a ${materialType} about ${topic}${subject ? ` for ${subject}` : ''}${gradeLevel ? ` for ${gradeLevel}` : ''}`;

    const params: any = {
      subject,
      grade_level: gradeLevel,
      topic,
    };

    if (materialType === 'worksheet' || materialType === 'quiz' || materialType === 'test') {
      if (numQuestions) params.num_questions = numQuestions;
      if (questionTypes) params.question_types = questionTypes;
      if (timeLimit) params.time_limit = timeLimit;
    }

    if (materialType === 'test') {
      if (totalPoints) params.total_points = totalPoints;
    }

    if (materialType === 'assignment') {
      if (requirements) params.requirements = requirements;
    }

    onGenerate(request, materialType, params);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Material Type
        </label>
        <select
          value={materialType}
          onChange={(e) => setMaterialType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="worksheet">Worksheet</option>
          <option value="quiz">Quiz</option>
          <option value="test">Test</option>
          <option value="assignment">Assignment</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic *
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Photosynthesis, World War II, Fractions"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Biology, History, Math"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grade Level
        </label>
        <input
          type="text"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          placeholder="e.g., 5th Grade, High School, AP"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {(materialType === 'worksheet' || materialType === 'quiz' || materialType === 'test') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              placeholder="e.g., 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Types
            </label>
            <input
              type="text"
              value={questionTypes}
              onChange={(e) => setQuestionTypes(e.target.value)}
              placeholder="e.g., Multiple Choice, Short Answer, Essay"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {materialType === 'quiz' || materialType === 'test' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit
              </label>
              <input
                type="text"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="e.g., 30 minutes, 1 hour"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : null}

          {materialType === 'test' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Points
              </label>
              <input
                type="number"
                value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </>
      )}

      {materialType === 'assignment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="e.g., 2-3 pages, include citations, use APA format"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <button
        onClick={handleGenerate}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Generate {materialType.charAt(0).toUpperCase() + materialType.slice(1)}
      </button>
    </div>
  );
}

