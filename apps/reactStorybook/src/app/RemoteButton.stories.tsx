import React, { Suspense } from 'react';
import { Meta, Story } from '@storybook/react';

// @ts-ignore
const LazyButton = React.lazy(() => import('reactRemoteUI/Button'));

const Button = (props: any) => (
  <Suspense fallback={<p>Please wait...</p>}>
    <LazyButton {...props} />
  </Suspense>
);

export default {
  title: 'Remote/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
  },
} as Meta;

const Template: Story = (args) => <Button {...args} />;

export const Primary: Story = Template.bind({ variant: 'primary' });
Primary.args = {
  variant: 'primary',
  children: <div>Button primary</div>,
};

export const Secondary: Story = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'Button secondary',
};
