import { Progress } from '../ui/progress';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthResult {
  score: number;
  feedback: string[];
  isValid: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: PasswordStrengthResult;
}

export function PasswordStrengthIndicator({ password, strength }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const getStrengthLabel = (score: number) => {
    if (score === 5) return 'Strong';
    if (score >= 3) return 'Medium';
    return 'Weak';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Progress 
          value={(strength.score / 5) * 100} 
          className="flex-1 h-2"
        />
        <span className="text-xs font-medium">
          {getStrengthLabel(strength.score)}
        </span>
      </div>
      
      {strength.feedback.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {strength.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center space-x-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>{feedback}</span>
            </div>
          ))}
        </div>
      )}
      
      {strength.isValid && (
        <div className="text-xs text-green-600 flex items-center space-x-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Password meets security requirements</span>
        </div>
      )}
    </div>
  );
}