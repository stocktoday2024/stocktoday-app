"use client";

import React, { useState, useRef, useEffect, useId } from "react";

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
  hint?: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[] | string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  label,
  error,
  required,
  id,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const autoId = useId();
  const selectId = id || autoId;

  // Normalize options to CustomSelectOption[]
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync focused index with current value when opening
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => opt.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && focusedIndex >= 0) {
      const item = listboxRef.current.children[focusedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
            onChange(normalizedOptions[focusedIndex].value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
        }
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", userSelect: "none" }}
    >
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 6,
          }}
        >
          {label} {required && <span style={{ color: "var(--down)" }}>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "var(--panel)",
          border: isOpen
            ? "1px solid var(--accent)"
            : error
            ? "1px solid var(--down)"
            : "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          color: selectedOption ? "var(--text)" : "var(--muted)",
          fontSize: "0.9rem",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          boxShadow: isOpen ? "0 0 0 2px rgba(251, 191, 36, 0.25)" : "none",
          transition: "all 0.15s ease",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            color: "var(--muted)",
            marginLeft: 8,
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu Options */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width: "100%",
            maxHeight: 260,
            overflowY: "auto",
            background: "var(--panel)",
            border: "1px solid var(--chip-border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            zIndex: 9999,
            listStyle: "none",
            padding: "4px 0",
            margin: 0,
          }}
        >
          {normalizedOptions.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = index === focusedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setFocusedIndex(index)}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 14px",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  color: isSelected ? "var(--accent)" : "var(--text)",
                  fontWeight: isSelected ? 600 : 400,
                  background: isFocused
                    ? "var(--panel-hover)"
                    : isSelected
                    ? "rgba(251, 191, 36, 0.08)"
                    : "transparent",
                  transition: "background 0.1s ease, color 0.1s ease",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span>{option.label}</span>
                  {option.hint && (
                    <span style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: 2 }}>
                      {option.hint}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {option.badge && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "var(--muted)",
                      }}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--down)", marginTop: 4 }}>
          {error}
        </span>
      )}
    </div>
  );
}

