# Profile and Avatar

Profile supports real device file selection for PNG, JPEG and WebP up to 5 MB. Uploads use private MinIO storage through a short-lived presigned PUT. Object keys are scoped to the authenticated user; completion and read reject keys outside that prefix.

The bucket is not public and internal paths are not shown. Profile persistence uses the existing authenticated PATCH and CSRF protection. Logo upload in onboarding remains a deterministic preview/persisted onboarding answer and is not claimed as the final organization media pipeline.
