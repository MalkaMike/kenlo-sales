/**
 * Playbook Router — generates the sales playbook PDF.
 * Uses publicProcedure since the playbook page is accessible to all authenticated users.
 */

import { publicProcedure, router } from "../_core/trpc";
import { generatePlaybookPDF } from "../pdf/pdfPlaybook";

export const playbookRouter = router({
  generatePDF: publicProcedure
    .mutation(async ({ ctx }) => {
      // Require authentication (any logged-in user can download)
      if (!ctx.user) {
        throw new Error("Faça login para baixar o playbook.");
      }

      const pdfBuffer = await generatePlaybookPDF();
      const dateStr = new Date().toISOString().split("T")[0];

      return {
        success: true,
        pdf: pdfBuffer.toString("base64"),
        filename: `Kenlo_Sales_Playbook_${dateStr}.pdf`,
      };
    }),
});
