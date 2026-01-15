import React, { useState } from "react";
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, TrendingUp, Sparkles, Star, Target, Zap, Loader2 } from 'lucide-react';

export default function FeedbackCard({ feedback, questionId, sessionId, originalAnswer, onAnswerImproved }) {
  const [improving, setImproving] = useState(false)
  const [improvedAnswer, setImprovedAnswer] = useState(null)
  const [improvementType, setImprovementType] = useState(null)
  if (!feedback) {
    return (
      <div className="card bg-gray-50 border-2 border-dashed border-gray-300">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E35336] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Evaluating your answer...</p>
          <p className="text-sm text-gray-500 mt-2">This usually takes 5-15 seconds</p>
        </div>
      </div>
    );
  }

  // Show loading state if feedback indicates it's still processing
  if (feedback.feedback && (feedback.feedback.includes('Evaluating') || feedback.feedback.includes('pending'))) {
    return (
      <div className="card bg-[#E35336]/5 border-2 border-[#E35336]/20">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[#1F2937] font-medium">{feedback.feedback}</p>
          <p className="text-sm text-[#6B7280] mt-2">Please wait, the AI is analyzing your answer...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error message
  if (feedback.feedback && feedback.feedback.includes('error') && feedback.feedback.includes('quota')) {
    return (
      <div className="card bg-yellow-50 border-2 border-yellow-200">
        <div className="py-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Using Fallback Evaluation</h4>
              <p className="text-yellow-800 text-sm mb-3">
                OpenAI API quota exceeded. Using rule-based evaluation instead.
              </p>
              <p className="text-yellow-700 text-xs">
                You're still getting quality feedback based on answer structure, length, and best practices!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleImprove = async (type) => {
    if (!questionId || !sessionId || !originalAnswer || improving) return
    
    setImproving(true)
    setImprovementType(type)
    try {
      const { interviewService } = await import('../../services/api')
      const result = await interviewService.improveAnswer(sessionId, questionId, originalAnswer, type)
      setImprovedAnswer(result.improvedAnswer)
      if (onAnswerImproved) {
        onAnswerImproved(result.improvedAnswer, type)
      }
    } catch (error) {
      console.error('Failed to improve answer:', error)
      alert('Failed to improve answer. Please try again.')
    } finally {
      setImproving(false)
    }
  }

  const score = parseFloat(feedback.score || 0);
  const clarityScore = feedback.clarityScore || feedback.clarity_score || null
  const structureScore = feedback.structureScore || feedback.structure_score || null
  const relevanceScore = feedback.relevanceScore || feedback.relevance_score || null
  const confidenceScore = feedback.confidenceScore || feedback.confidence_score || null
  
  const scoreColor = score >= 8 ? 'text-green-600' : score >= 6 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = score >= 8 ? 'bg-green-100' : score >= 6 ? 'bg-yellow-100' : 'bg-red-100';

  const ScoreBar = ({ label, value, color = 'primary' }) => {
    if (value === null || value === undefined) return null
    const colors = {
      primary: 'bg-[#E35336]',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-[#E35336]',
    }
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-900">{value.toFixed(1)}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${colors[color] || colors.primary}`}
            style={{ width: `${(value / 10) * 100}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Your Score</h3>
          <div className={`px-4 py-2 rounded-lg ${scoreBg} ${scoreColor} font-bold text-xl`}>
            {score.toFixed(1)}/10
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(score / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed Scores */}
      {(clarityScore !== null || structureScore !== null || relevanceScore !== null || confidenceScore !== null) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Detailed Breakdown</h4>
          <ScoreBar label="Clarity" value={clarityScore} color="blue" />
          <ScoreBar label="Structure" value={structureScore} color="green" />
          <ScoreBar label="Relevance" value={relevanceScore} color="primary" />
          <ScoreBar label="Confidence" value={confidenceScore} color="yellow" />
        </div>
      )}

      {/* Feedback Text */}
      {feedback.feedback && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-[#E35336]" />
            Detailed Feedback
          </h4>
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {feedback.feedback}
          </p>
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {(Array.isArray(feedback.strengths) ? feedback.strengths : JSON.parse(feedback.strengths || '[]')).map((strength, i) => (
              <li key={i} className="flex items-start text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements && feedback.improvements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-yellow-600" />
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {(Array.isArray(feedback.improvements) ? feedback.improvements : JSON.parse(feedback.improvements || '[]')).map((improvement, i) => (
              <li key={i} className="flex items-start text-gray-700">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improve Answer Buttons */}
      {questionId && sessionId && originalAnswer && (
        <div className="border-t pt-6 mt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-[#E35336]" />
            Improve Your Answer
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => handleImprove('improve')}
              disabled={improving}
              className="flex items-center space-x-2 px-4 py-2 bg-[#E35336]/10 hover:bg-[#E35336]/20 text-[#E35336] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {improving && improvementType === 'improve' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Improving...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Improve My Answer</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleImprove('star')}
              disabled={improving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {improving && improvementType === 'star' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rewriting...</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  <span>Rewrite in STAR Format</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleImprove('senior')}
              disabled={improving}
              className="flex items-center space-x-2 px-4 py-2 bg-[#F4A460]/10 hover:bg-[#F4A460]/20 text-[#F4A460] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {improving && improvementType === 'senior' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Make it Senior-Level</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleImprove('metrics')}
              disabled={improving}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {improving && improvementType === 'metrics' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Metrics...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Add Metrics & Impact</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Improved Answer Display */}
      {improvedAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-[#E35336]/5 border border-[#E35336]/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-md font-semibold text-[#1F2937]">
              Improved Answer ({improvementType === 'star' ? 'STAR Format' : improvementType === 'senior' ? 'Senior-Level' : improvementType === 'metrics' ? 'With Metrics' : 'Enhanced'})
            </h4>
            <button
              onClick={() => {
                setImprovedAnswer(null)
                setImprovementType(null)
              }}
              className="text-[#E35336] hover:text-[#A0522D] text-sm"
            >
              Close
            </button>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
            {improvedAnswer}
          </p>
          {onAnswerImproved && (
            <button
              onClick={() => {
                onAnswerImproved(improvedAnswer, improvementType)
                setImprovedAnswer(null)
              }}
              className="mt-3 px-4 py-2 bg-[#E35336] text-white rounded-lg hover:bg-[#A0522D] transition-colors text-sm font-medium"
            >
              Use This Improved Answer
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
