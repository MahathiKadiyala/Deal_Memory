"""
Hindsight Experiential Memory Service for DealMemory.

This service manages experiential memory retention and recall using the official
hindsight-client Python package.

BANK ISOLATION STRATEGY:
-----------------------
Multi-tenant security requires that no user or deal can ever access or collide
with another user's experiential memories. The bank scope is derived strictly
server-side from the authenticated user ID and authorized deal ID:

    Pattern: {bank_prefix}-user-{user_id}-deal-{deal_id}
    Example: dealmemory-user-e1792eae-ea72-4f96-b531-991aac861985-deal-1dc2bb8b-a54e-4a34-9d8a-42f717f2e305

This guarantees:
1. Complete isolation between separate user accounts.
2. Complete isolation between separate deals owned by the same user.
3. No reliance on or trust in client-provided bank identifiers.
4. Deterministic derivation allowing consistent recall for authorized users.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from hindsight_client import Hindsight, RecallResponse, RetainResponse

from app.core.config import settings

logger = logging.getLogger("dealmemory.hindsight")


class HindsightService:
    def __init__(self) -> None:
        self._client: Optional[Hindsight] = None

    def is_configured(self) -> bool:
        """Checks if Hindsight API credentials and base URL are configured."""
        return bool(settings.hindsight_api_key and settings.hindsight_api_key.strip())

    @property
    def client(self) -> Hindsight:
        """Returns the shared Hindsight client singleton."""
        if self._client is None:
            base_url = settings.hindsight_base_url or "https://api.hindsight.vectorize.io"
            api_key = settings.hindsight_api_key.strip() if settings.hindsight_api_key else ""
            self._client = Hindsight(base_url=base_url, api_key=api_key)
        return self._client

    @staticmethod
    def get_bank_id_for_deal(user_id: uuid.UUID, deal_id: uuid.UUID) -> str:
        """
        Derives the deterministic, isolated Hindsight bank ID for a specific user and deal.
        Ensures strict multi-tenant boundary.
        """
        raw_prefix = settings.hindsight_bank_id or "dealmemory"
        clean_prefix = "".join(
            c if c.isalnum() or c == "-" else "" for c in raw_prefix.strip()
        ).strip("-") or "dealmemory"
        return f"{clean_prefix}-user-{user_id}-deal-{deal_id}"

    @staticmethod
    def format_interaction_memory(
        account_name: str,
        deal_name: Optional[str],
        stakeholder_name: Optional[str],
        stakeholder_role: Optional[str],
        interaction_type: str,
        interaction_date: datetime,
        concern: Optional[str],
        approach: Optional[str],
        outcome: str,
        notes: Optional[str],
    ) -> str:
        """
        Formats factual, durable experiential sales memory from an interaction.
        Focuses on objections, approaches, customer signals, and outcomes.
        Never injects synthetic facts or secrets.
        """
        lines = []
        if deal_name:
            lines.append(f"Deal: {deal_name}")
        lines.append(f"Account: {account_name}")
        if stakeholder_name:
            role_part = f", {stakeholder_role}" if stakeholder_role else ""
            lines.append(f"Stakeholder: {stakeholder_name}{role_part}")
        lines.append(f"Interaction Type: {interaction_type}")
        date_str = interaction_date.strftime("%Y-%m-%d %H:%M UTC") if interaction_date else "Recent"
        lines.append(f"Interaction Date: {date_str}")
        if concern and concern.strip():
            lines.append(f"Customer Concern/Objection: {concern.strip()}")
        if approach and approach.strip():
            lines.append(f"Approach/Tactic Used: {approach.strip()}")
        lines.append(f"Outcome: {outcome.strip() if outcome else 'Neutral'}")
        if notes and notes.strip():
            lines.append(f"Notes & Lessons: {notes.strip()}")
        return "\n".join(lines)

    async def retain(
        self,
        user_id: uuid.UUID,
        deal_id: uuid.UUID,
        content: str,
        context: Optional[str] = None,
        document_id: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        timestamp: Optional[datetime] = None,
    ) -> Tuple[bool, str, Optional[str]]:
        """
        Retains an experiential sales memory into the isolated deal bank.

        Returns:
            Tuple[bool, str, Optional[str]]: (success, memory_sync_status, error_message)
            - ("retained", None) on success
            - ("skipped", None) if Hindsight is not configured
            - ("failed", safe_error_message) on API failure
        """
        if not self.is_configured():
            logger.info("Hindsight is not configured with an API key; skipping memory retain.")
            return False, "skipped", None

        bank_id = self.get_bank_id_for_deal(user_id=user_id, deal_id=deal_id)

        try:
            retain_meta = metadata or {}
            retain_meta["deal_id"] = str(deal_id)
            retain_meta["user_id"] = str(user_id)

            response: RetainResponse = await self.client.aretain(
                bank_id=bank_id,
                content=content,
                timestamp=timestamp or datetime.now(timezone.utc),
                context=context,
                document_id=document_id,
                metadata=retain_meta,
            )
            logger.info("Successfully retained memory to Hindsight bank %s", bank_id)
            return True, "retained", None
        except Exception as e:
            # Log safe error without exposing credentials or internal traces
            logger.warning(
                "Hindsight memory retention failed for bank %s: %s",
                bank_id,
                type(e).__name__,
            )
            return False, "failed", "Interaction saved, but Hindsight memory update failed."

    async def recall(
        self,
        user_id: uuid.UUID,
        deal_id: uuid.UUID,
        query: str,
        max_tokens: int = 4096,
        budget: str = "mid",
    ) -> Tuple[List[Dict[str, Any]], Optional[str], Optional[str]]:
        """
        Recalls relevant experiential memories for a deal from its isolated bank.

        Returns:
            Tuple[List[Dict], Optional[str], Optional[str]]:
            (memories_list, prompt_context_string, error_message)
        """
        if not self.is_configured():
            logger.info("Hindsight is not configured; cannot recall memories.")
            return [], None, "Hindsight memory service is not configured with an API key."

        bank_id = self.get_bank_id_for_deal(user_id=user_id, deal_id=deal_id)

        try:
            response: RecallResponse = await self.client.arecall(
                bank_id=bank_id,
                query=query,
                max_tokens=max_tokens,
                budget=budget,
            )

            memories: List[Dict[str, Any]] = []
            for item in response.results or []:
                memories.append(
                    {
                        "id": getattr(item, "id", None),
                        "text": getattr(item, "text", ""),
                        "context": getattr(item, "context", None),
                        "occurred_start": getattr(item, "occurred_start", None),
                        "occurred_end": getattr(item, "occurred_end", None),
                        "score": (
                            getattr(item, "scores", {}).get("relevance")
                            if isinstance(getattr(item, "scores", None), dict)
                            else None
                        ),
                    }
                )

            prompt_context: Optional[str] = None
            try:
                prompt_context = response.to_prompt_string()
            except Exception:
                prompt_context = "\n\n".join(m["text"] for m in memories if m.get("text"))

            return memories, prompt_context, None
        except Exception as e:
            err_str = str(e).lower()
            # If bank does not exist yet (e.g. brand new deal before any retains), treat as empty memories
            if "not found" in err_str or getattr(e, "status", None) == 404:
                return [], None, None
            logger.warning(
                "Hindsight recall failed for bank %s: %s",
                bank_id,
                type(e).__name__,
            )
            return [], None, f"Memory recall failed: {type(e).__name__}"

    @staticmethod
    def build_deal_preparation_query(
        deal_name: str,
        stage: str,
        main_objection: Optional[str] = None,
        next_action: Optional[str] = None,
    ) -> str:
        """
        Builds a contextual recall question tailored to the deal's current status and challenges.
        """
        parts = [f"What past approaches, objections, and outcomes were experienced in deal '{deal_name}' at stage '{stage}'?"]
        if main_objection and main_objection.strip():
            parts.append(f"Specifically, how was the objection '{main_objection.strip()}' addressed?")
        if next_action and next_action.strip():
            parts.append(f"What prior lessons or commitments inform the next action '{next_action.strip()}'?")
        return " ".join(parts)


# Global reusable Hindsight service instance
hindsight_service = HindsightService()
