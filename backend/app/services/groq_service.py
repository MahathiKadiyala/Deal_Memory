"""
Groq LLM Service for DealMemory.

This service coordinates AI reasoning over PostgreSQL deal data and
experiential memories recalled from Hindsight Cloud to produce grounded,
actionable executive sales briefings.

Never exposes or logs GROQ_API_KEY.
"""

import json
import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple

from groq import AsyncGroq, GroqError

from app.core.config import settings
from app.schemas.briefing import DealBriefingContent

logger = logging.getLogger("dealmemory.groq")


class GroqService:
    def __init__(self) -> None:
        self._client: Optional[AsyncGroq] = None

    def is_configured(self) -> bool:
        """Checks if GROQ_API_KEY is configured in the environment."""
        return bool(settings.groq_api_key and settings.groq_api_key.strip())

    @property
    def client(self) -> AsyncGroq:
        """Returns the shared AsyncGroq client instance."""
        if self._client is None:
            api_key = settings.groq_api_key.strip() if settings.groq_api_key else ""
            self._client = AsyncGroq(api_key=api_key)
        return self._client

    @property
    def model_name(self) -> str:
        """Returns the configured Groq model identifier."""
        return settings.groq_model or "openai/gpt-oss-120b"

    @staticmethod
    def build_briefing_prompt(
        deal_name: str,
        deal_value: Optional[float],
        stage: str,
        health: str,
        main_objection: Optional[str],
        next_action: Optional[str],
        account_name: str,
        account_industry: Optional[str],
        account_notes: Optional[str],
        stakeholders: List[Dict[str, Any]],
        recent_interactions: List[Dict[str, Any]],
        recalled_memories: List[Dict[str, Any]],
        hindsight_prompt_context: Optional[str] = None,
    ) -> Tuple[str, str]:
        """
        Builds grounded system and user prompts incorporating:
        1. Current Deal State
        2. Account Information
        3. Key Stakeholders
        4. Recent Interactions (PostgreSQL CRM log)
        5. Experiential Memory from Hindsight Cloud
        """
        system_prompt = (
            "You are the DealMemory AI Executive Sales Briefing Assistant. Your mission is to "
            "synthesize current sales deal parameters and factual experiential memory from Hindsight "
            "into a concise, highly strategic, and grounded briefing.\n\n"
            "STRICT GROUNDING & INTEGRITY RULES:\n"
            "1. Ground all insights strictly in the provided deal data, interactions, and Hindsight experiential memory.\n"
            "2. NEVER invent, assume, or hallucinate past sales interactions, client remarks, competitors, or promises.\n"
            "3. If evidence does not support a claim or a section (e.g. what failed or what worked), you MUST explicitly state: "
            "'Insufficient recorded evidence.'\n"
            "4. Use evidence-based, objective language (e.g., 'Based on previously recorded interactions...', 'Recorded experience suggests...') "
            "rather than absolute guarantees (NEVER say 'This tactic will definitely win the deal').\n"
            "5. Clearly distinguish between recorded objections/approaches and unverified assumptions.\n"
            "6. Output MUST be valid JSON adhering strictly to the requested schema keys."
        )

        user_prompt_lines = [
            "# EXECUTIVE DEAL BRIEFING REQUEST",
            "",
            "## 1. CURRENT DEAL PARAMETERS",
            f"- Deal Name: {deal_name}",
            f"- Deal Value: ${deal_value:,.2f}" if deal_value is not None else "- Deal Value: Not specified",
            f"- Current Stage: {stage}",
            f"- Deal Health: {health}",
            f"- Main Objection: {main_objection if main_objection else 'None recorded'}",
            f"- Scheduled Next Action: {next_action if next_action else 'None recorded'}",
            "",
            "## 2. CLIENT ACCOUNT",
            f"- Account Name: {account_name}",
            f"- Industry: {account_industry if account_industry else 'General Enterprise'}",
        ]

        if account_notes and account_notes.strip():
            user_prompt_lines.append(f"- Account Context: {account_notes.strip()}")

        user_prompt_lines.append("")
        user_prompt_lines.append("## 3. KEY STAKEHOLDERS")
        if stakeholders:
            for s in stakeholders:
                role = s.get("role") or "Unknown Role"
                name = s.get("name") or "Unknown"
                email = s.get("email")
                details = [f"Role: {role}"]
                if email:
                    details.append(f"Email: {email}")
                user_prompt_lines.append(f"- {name} ({'; '.join(details)})")
        else:
            user_prompt_lines.append("- No specific stakeholders recorded yet.")

        user_prompt_lines.append("")
        user_prompt_lines.append("## 4. RECENT CRM INTERACTIONS")
        if recent_interactions:
            for idx, inter in enumerate(recent_interactions, 1):
                i_type = inter.get("type", "Interaction")
                i_date = inter.get("interaction_date", "Recent")
                concern = inter.get("concern")
                approach = inter.get("approach")
                outcome = inter.get("outcome", "Neutral")
                notes = inter.get("notes")

                inter_summary = f"{idx}. [{i_date}] {i_type} — Outcome: {outcome}"
                if concern:
                    inter_summary += f" | Concern: {concern}"
                if approach:
                    inter_summary += f" | Approach: {approach}"
                if notes:
                    inter_summary += f" | Notes: {notes}"
                user_prompt_lines.append(inter_summary)
        else:
            user_prompt_lines.append("- No CRM interactions recorded yet.")

        user_prompt_lines.append("")
        user_prompt_lines.append("## 5. EXPERIENTIAL MEMORY FROM HINDSIGHT")
        user_prompt_lines.append(
            "(The following experiential memories were recalled from Hindsight Cloud based on "
            "similar past interactions, objections, and sales outcomes for this deal:)"
        )
        if recalled_memories:
            for m in recalled_memories:
                text = m.get("text", "").strip()
                if text:
                    user_prompt_lines.append(f"- {text}")
        elif hindsight_prompt_context and hindsight_prompt_context.strip():
            user_prompt_lines.append(hindsight_prompt_context.strip())
        else:
            user_prompt_lines.append("- No past experiential memories recorded for this deal in Hindsight yet.")

        user_prompt_lines.extend(
            [
                "",
                "## REQUIRED OUTPUT JSON SCHEMA",
                "Produce a single valid JSON object with EXACTLY the following structure:",
                "{",
                '  "key_points": ["Key deal dynamic or strategic takeaway grounded in evidence"],',
                '  "what_worked": ["Specific tactic or framing that succeeded based on past evidence; or \'Insufficient recorded evidence\'"],',
                '  "what_failed": ["Specific approach or discount tactic that stalled or backfired based on evidence; or \'Insufficient recorded evidence\'"],',
                '  "stakeholders": ["Grounded notes on stakeholder priorities, concerns, or alignment"],',
                '  "pending_commitments": ["Active commitments, promises, or pending deliverables noted in records"],',
                '  "recommended_approach": "Precise, grounded tactical recommendation for the next interaction using evidence-based phrasing",',
                '  "evidence": ["Factual references citing specific interaction dates or Hindsight experiential memories supporting this briefing"]',
                "}",
            ]
        )

        user_prompt = "\n".join(user_prompt_lines)
        return system_prompt, user_prompt

    async def generate_deal_briefing(
        self,
        deal_name: str,
        deal_value: Optional[float],
        stage: str,
        health: str,
        main_objection: Optional[str],
        next_action: Optional[str],
        account_name: str,
        account_industry: Optional[str],
        account_notes: Optional[str],
        stakeholders: List[Dict[str, Any]],
        recent_interactions: List[Dict[str, Any]],
        recalled_memories: List[Dict[str, Any]],
        hindsight_prompt_context: Optional[str] = None,
    ) -> Tuple[DealBriefingContent, str]:
        """
        Executes a real call to Groq LLM to generate the grounded Deal Briefing.

        Returns:
            Tuple[DealBriefingContent, str]: (parsed_briefing, model_used)

        Raises:
            RuntimeError: If GROQ_API_KEY is not configured.
            GroqError: If Groq API call fails.
            ValueError: If response format is invalid or violates schema.
        """
        if not self.is_configured():
            raise RuntimeError(
                "GROQ_API_KEY is not configured in environment. "
                "Please configure GROQ_API_KEY in backend/.env."
            )

        system_prompt, user_prompt = self.build_briefing_prompt(
            deal_name=deal_name,
            deal_value=deal_value,
            stage=stage,
            health=health,
            main_objection=main_objection,
            next_action=next_action,
            account_name=account_name,
            account_industry=account_industry,
            account_notes=account_notes,
            stakeholders=stakeholders,
            recent_interactions=recent_interactions,
            recalled_memories=recalled_memories,
            hindsight_prompt_context=hindsight_prompt_context,
        )

        model = self.model_name
        logger.info("Generating deal briefing using Groq model '%s'", model)

        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                model=model,
                response_format={"type": "json_object"},
                temperature=0.2,
            )
        except GroqError as ge:
            # Safe log without revealing keys or sensitive payloads
            logger.warning("Groq API error encountered: %s", type(ge).__name__)
            raise ge
        except Exception as e:
            logger.warning("Failed to connect to Groq: %s", type(e).__name__)
            raise e

        if not chat_completion.choices or not chat_completion.choices[0].message.content:
            raise ValueError("Groq returned an empty response.")

        raw_content = chat_completion.choices[0].message.content.strip()

        try:
            # Parse and validate against Pydantic schema
            briefing = DealBriefingContent.model_validate_json(raw_content)
            return briefing, model
        except Exception as ve:
            logger.warning("Pydantic validation failed for Groq briefing output: %s", str(ve))
            # Attempt json parse in case minor top-level wrapper exists
            try:
                data = json.loads(raw_content)
                if "briefing" in data and isinstance(data["briefing"], dict):
                    briefing = DealBriefingContent.model_validate(data["briefing"])
                    return briefing, model
            except Exception:
                pass
            raise ValueError(f"Failed to validate Groq response against schema: {ve}")


# Global reusable Groq service instance
groq_service = GroqService()
