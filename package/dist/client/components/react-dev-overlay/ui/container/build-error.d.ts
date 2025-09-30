import React from 'react';
import type { ErrorBaseProps } from '../components/errors/error-overlay/error-overlay';
export interface BuildErrorProps extends ErrorBaseProps {
    message: string;
}
export declare const BuildError: React.FC<BuildErrorProps>;
export declare const styles = "";
