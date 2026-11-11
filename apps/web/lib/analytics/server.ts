import 'server-only';
import { setAnalyticsScheduler } from '@easyrender/core';
import { after } from 'next/server';

setAnalyticsScheduler((work) => after(work));
