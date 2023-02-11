import { ComponentProps } from 'react';
import type { Story } from '@storybook/react';
import ModalTip from './ModalTip';
export default {
  title: 'ModalTip',
  component: ModalTip,
};
const Template: Story<ComponentProps<typeof ModalTip>> = (args) => (
  <ModalTip {...args} />
);
export const FirstStory = Template;
FirstStory.args = {};
