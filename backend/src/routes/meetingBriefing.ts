
import { Router } from 'express';
import { generateMeetingBriefing } from '../services/meetingBriefing.js';

const router = Router();

router.post('/', async (request, response) => {
  const { companyOrPerson, meetingPurpose, meetingDateTime } =
    request.body ?? {};

  if (
    typeof companyOrPerson !== 'string' ||
    !companyOrPerson.trim() ||
    companyOrPerson.trim().length > 200 ||
    typeof meetingPurpose !== 'string' ||
    !meetingPurpose.trim() ||
    meetingPurpose.trim().length > 1000 ||
    (meetingDateTime !== undefined &&
      typeof meetingDateTime !== 'string')
  ) {
    response.status(400).json({
      error: 'Provide a valid company or person and meeting purpose.',
    });
    return;
  }

  try {
    const result = await generateMeetingBriefing({
      companyOrPerson: companyOrPerson.trim(),
      meetingPurpose: meetingPurpose.trim(),
      meetingDateTime: meetingDateTime?.trim() || undefined,
    });

    response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Meeting briefing failed:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error';

    const status =
      message.includes('not configured') ? 503 : 502;

    response.status(status).json({
      error:
        message.includes('No relevant recent articles')
          ? message
          : 'Meeting briefing could not be generated. Check the backend terminal for details.',
    });
  }
});

export default router;
