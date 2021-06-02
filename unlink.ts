#!/usr/bin/env node
import { unlinkArvisGlobalModule } from './';

unlinkArvisGlobalModule().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
