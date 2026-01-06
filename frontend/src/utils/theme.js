/**
 * Theme utility for checking and setting the application theme.
 */

// Function to check system preference
export const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Function to get initial theme from local storage or system preference
export const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return getSystemTheme();
};

// Function to set the theme on the document
export const applyTheme = (theme) => {
  const root = document.documentElement;
  const isDark = theme === 'dark';
  
  // Set the data-theme attribute for CSS selectors
  root.setAttribute('data-theme', theme);
  
  // Optional: Add/remove a class if needed by other libs
  if (isDark) {
    root.classList.add('dark-mode');
  } else {
    root.classList.remove('dark-mode');
  }
};
