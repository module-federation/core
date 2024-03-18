import {
  NativeFederationTestsHost as GeneralHost,
  NativeFederationTestsRemote as GeneralRemote,
} from '.';

export const NativeFederationTestsRemote = GeneralRemote.rolldown;
export const NativeFederationTestsHost = GeneralHost.rolldown;
