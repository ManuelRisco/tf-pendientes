<?php

class CatalogoModel {

    public function getRoles(): array {
        return Rol::select('id', 'nombre')->orderBy('id')->get()->toArray();
    }

    public function getEstados(): array {
        return Estado::select('id', 'nombre')->orderBy('id')->get()->toArray();
    }

    public function getPrioridades(): array {
        return Prioridad::select('id', 'nombre')->orderBy('id')->get()->toArray();
    }
}
