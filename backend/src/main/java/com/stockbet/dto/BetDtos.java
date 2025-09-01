package com.stockbet.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class BetDtos {
    public static class PlaceBetRequest {
        @NotNull public UUID marketId;
        @NotNull public String outcome;
        @NotNull public BigDecimal amount;
    }
}
