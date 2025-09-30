import { type FormProps } from './form-shared';
export type { FormProps };
declare const Form: import("react").ForwardRefExoticComponent<Omit<{
    action: NonNullable<string | ((formData: FormData) => void | Promise<void>) | undefined>;
    prefetch?: false | null;
    replace?: boolean;
    scroll?: boolean;
} & Omit<import("react").HTMLProps<HTMLFormElement>, "action" | "method" | "target" | "encType">, "ref"> & import("react").RefAttributes<HTMLFormElement>>;
export default Form;
