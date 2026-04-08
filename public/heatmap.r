library(ggplot2)
library(dplyr)

corrs_species <- read.table('Species_correlations_filt_g.txt', header=T, stringsAsFactors=F)

# create matrix and cluster
corr_matrix <- corrs_species %>%
  pivot_wider(names_from = species, values_from = correlation, values_fill = NA) %>%
  column_to_rownames("cancer_type") %>%
  as.matrix()
corr_matrix <- corr_matrix[rowSums(!is.na(corr_matrix)) > 0,
                          colSums(!is.na(corr_matrix)) > 0]

row_order <- hclust(dist(corr_matrix, method = "euclidean"), method = "complete")$order
col_order <- hclust(dist(t(corr_matrix), method = "euclidean"), method = "complete")$order
corrs_species_clustered <- corrs_species %>%
  mutate(
    cancer_type = factor(cancer_type, levels = rownames(corr_matrix)[row_order]),
    species = factor(species, levels = colnames(corr_matrix)[col_order])
  )


ggplot(corrs_species_clustered, aes(x = species, y = cancer_type, fill = correlation)) +
  geom_tile() +
  scale_fill_gradient2(low = "blue", mid = "white", high = "red", midpoint = 0.5) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1, size = 8),
        axis.text.y = element_text(size = 8)) +
  labs(title = "Species-Cancer Type Correlations", 
       fill = "Correlation")