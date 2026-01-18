import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const validatePassword = (password: string): PasswordValidation => {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  return {
    isValid: hasMinLength && hasLetter && hasNumber && hasSpecialChar,
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecialChar,
  };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  if (!password) return null;

  const validation = validatePassword(password);
  
  const getStrengthColor = () => {
    const validCount = [
      validation.hasMinLength,
      validation.hasLetter,
      validation.hasNumber,
      validation.hasSpecialChar,
    ].filter(Boolean).length;

    if (validCount === 4) return "#10b981"; // green
    if (validCount >= 2) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  const getStrengthText = () => {
    if (validation.isValid) return "Fort";
    const validCount = [
      validation.hasMinLength,
      validation.hasLetter,
      validation.hasNumber,
      validation.hasSpecialChar,
    ].filter(Boolean).length;
    if (validCount >= 2) return "Moyen";
    return "Faible";
  };

  return (
    <View style={styles.container}>
      <View style={styles.strengthBar}>
        <View
          style={[
            styles.strengthFill,
            {
              backgroundColor: getStrengthColor(),
              width: `${
                ([
                  validation.hasMinLength,
                  validation.hasLetter,
                  validation.hasNumber,
                  validation.hasSpecialChar,
                ].filter(Boolean).length /
                  4) *
                100
              }%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
        {getStrengthText()}
      </Text>

      <View style={styles.requirements}>
        <RequirementItem
          met={validation.hasMinLength}
          text="Minimum 8 caractères"
        />
        <RequirementItem met={validation.hasLetter} text="Au moins 1 lettre" />
        <RequirementItem met={validation.hasNumber} text="Au moins 1 chiffre" />
        <RequirementItem
          met={validation.hasSpecialChar}
          text="Au moins 1 caractère spécial (@$!%*?&)"
        />
      </View>
    </View>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => (
  <View style={styles.requirement}>
    <Text style={[styles.checkmark, met && styles.checkmarkMet]}>
      {met ? "✓" : "○"}
    </Text>
    <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 12,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirements: {
    gap: 4,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkmark: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "bold",
  },
  checkmarkMet: {
    color: "#10b981",
  },
  requirementText: {
    fontSize: 12,
    color: "#6b7280",
  },
  requirementTextMet: {
    color: "#10b981",
  },
});

export default PasswordStrengthIndicator;
