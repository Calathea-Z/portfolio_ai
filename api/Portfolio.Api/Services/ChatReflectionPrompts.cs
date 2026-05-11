namespace Portfolio.Api.Services;

internal static class ChatReflectionPrompts
{
    /// <summary>Uncached system appendix when <see cref="Options.ReflectionOptions.PlannerEnabled"/> is on.</summary>
    internal const string PlannerAppendix =
        "Planning: If the visitor's question is in scope (Zach's resume/portfolio facts), before your first tool call in a turn write one short sentence listing which resume tools you will call and why, then call them, then answer in clear prose grounded only in tool outputs. "
        + "If the question is out of scope for this assistant, refuse briefly without calling tools — do not use tools as a pretext to add general advice.";
}
