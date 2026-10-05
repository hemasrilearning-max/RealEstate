package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerClientDTO;
import com.realestate.modules.Broker.service.BrokerClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/broker/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerClientController {

    private final BrokerClientService clientService;

    /**
     * Link an existing BUYER (from users table) to this broker.
     * Body must contain userId (buyer’s users.id).
     */
    @PostMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<BrokerClientDTO>> create(
            @PathVariable Long brokerId,
            @RequestBody BrokerClientDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BrokerApiResponse.success(
                        "Client linked successfully",
                        clientService.createClient(brokerId, dto)
                ));
    }

    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerClientDTO>>> getAll(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        clientService.getAllClientsByBroker(brokerId)
                )
        );
    }

    @GetMapping("/{brokerId}/paged")
    public ResponseEntity<BrokerApiResponse<Page<BrokerClientDTO>>> getPaged(
            @PathVariable Long brokerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        clientService.getClientsByBrokerPaged(brokerId, page, size)
                )
        );
    }

    @GetMapping("/{brokerId}/{clientId}")
    public ResponseEntity<BrokerApiResponse<BrokerClientDTO>> getOne(
            @PathVariable Long brokerId,
            @PathVariable Long clientId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        clientService.getClientById(brokerId, clientId)
                )
        );
    }

    @PutMapping("/{brokerId}/{clientId}")
    public ResponseEntity<BrokerApiResponse<BrokerClientDTO>> update(
            @PathVariable Long brokerId,
            @PathVariable Long clientId,
            @RequestBody BrokerClientDTO dto) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Client updated",
                        clientService.updateClient(brokerId, clientId, dto)
                )
        );
    }

    @DeleteMapping("/{brokerId}/{clientId}")
    public ResponseEntity<BrokerApiResponse<Void>> delete(
            @PathVariable Long brokerId,
            @PathVariable Long clientId) {

        clientService.deleteClient(brokerId, clientId);
        return ResponseEntity.ok(
                BrokerApiResponse.success("Client unlinked", null)
        );
    }
}
