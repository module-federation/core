import React, { HTMLProps } from 'react';
import classNames from 'classnames';

import styles from './Button.module.css';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset' | undefined;
  variant?: 'primary' | 'secondary';
} & HTMLProps<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'primary', ...props }, ref) => {
    const cssClasses = classNames(styles.button, {
      [styles.primary]: variant === 'primary',
      [styles.secondary]: variant === 'secondary',
    });

    return (
      <button {...props} ref={ref} className={`${cssClasses} ${className}`}>
        {children}
      </button>
    );
  },
);

export default Button;
