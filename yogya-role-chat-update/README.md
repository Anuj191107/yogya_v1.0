# Yogya role-specific Sarthi chat update

This update changes the guidance experience so each selected role sees only its own Sarthi assistant. The phone-style assistant can be opened as a modal popup from the workspace header or the guidance screen. The Ministry dashboard has its own Ask Sarthi entry point, which opens the Ministry assistant.

## Apply
1. Back up the existing project.
2. Extract this archive to a temporary folder and copy the updated project files into the existing project.
3. Preserve the existing `.env.local` file and Gemini API key.
4. Run `npm.cmd run dev` from the project folder.

The project keeps the existing Next.js app, CNC/MRI simulations, dashboards, and `/api/chat` route. Assistant requests continue to include the current role in the API request.
