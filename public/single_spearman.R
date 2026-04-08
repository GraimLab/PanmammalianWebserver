setwd("C:/Users/gi.padovani/OneDrive - University of Florida/MammalianCancer/corrected_clean_runs_tss_EH_cosmic/")
library('tidyverse')
library(ggplot2)
library(reshape2)
library(svglite)
library(dplyr)

corrs_species <- read.table('Species_correlations_filt_g.txt', header=T)
species_data <- read.table('C:/Users/gi.padovani/OneDrive - University of Florida/MammalianCancer/sp_family_order.txt', 
                          header=FALSE, stringsAsFactors=FALSE)
colnames(species_data) <- c("species", "family", "order")

corrs_species_orders <- corrs_species %>%
  left_join(species_data, by = "species")

species_order_arranged <- corrs_species_orders %>%
  arrange(order, species) %>%
  pull(species) %>%
  unique()

corrs_species_orders$species <- factor(corrs_species_orders$species, levels = species_order_arranged)


# Create list of available cancer types
cancer_list <- unique(corrs_species_orders$cancer_type)
cat("Available cancer types:\n")
for(i in 1:length(cancer_list)) {
  cat(paste(i, "-", cancer_list[i], "\n"))
}

plot_cancer_correlation_by_order <- function(cancer_number) {
  selected_cancer <- cancer_list[cancer_number]
  
  cancer_data <- corrs_species_orders %>%
    filter(cancer_type == selected_cancer)
  
  ggplot(cancer_data, aes(x = species, y = correlation, color = order)) +  # Fixed: added missing )
    geom_point(size = 4, alpha = 0.8) +
    scale_color_manual(values = order_colors, name = "Order") +
    theme_bw() +
    theme(axis.text.x = element_text(angle = 90, hjust = 1, size = 6), 
          legend.position = "none") +
    labs(title = paste("Spearman Correlation for", selected_cancer),
         y = "Spearman Correlation",
         x = "Species (Grouped by Order)")
}

# Create named vector matching orders
order_colors <- c(
"Carnivora" = "#FF0000",
"Rodentia" = "#0000FF",
"Primates" = "#00FF00",
"Cetartiodactyla" = "#FF00FF",
"Chiroptera" = "#FFA500",
"Perissodactyla" = "#800080",
"Cingulata" = "#008080",
"Lagomorpha" = "#A52A2A",
"Afrosoricida" = "#FFD700",
"Eulipotyphla" = "#717664",
"Macroscelidea" = "#FFA6C9",
"Dermoptera" = "#FF1493",
"Hyracoidea" = "#F88379",
"Proboscidea" = "#001219",
"Pholidota" = "#E6E6FA",
"Tubulidentata" = "#00CED1",
"Sirenia" = "#FF6347",
"Scandentia" = "#4682B4",
"Pilosa" = "#D2691E"
)
# Updated function with your custom colors
plot_cancer_correlation_by_order <- function(cancer_number) {
selected_cancer <- cancer_list[cancer_number]
cancer_data <- corrs_species_orders %>%
filter(cancer_type == selected_cancer)
ggplot(cancer_data, aes(x = species, y = correlation, color = order)) +
geom_point(size = 4, alpha = 0.8) +
scale_color_manual(values = order_colors, name = "Order") +
theme_bw()+
theme(axis.text.x = element_text(angle = 90, hjust = 1, size = 6), legend.position = "none") +
labs(title = paste("Spearman Correlation for", selected_cancer),
y = "Spearman Correlation",
x = "Species (Grouped by Order)")
}
# Generate all plots at once
for(i in 1:length(cancer_list)) {
print(plot_cancer_correlation_by_order(i))
}
## or single
plot_cancer_correlation_by_order(3)
plot_cancer_correlation_by_order(1)
plot_cancer_correlation_by_order(2)
plot_cancer_correlation_by_order(4)
plot_cancer_correlation_by_order(5)
plot_cancer_correlation_by_order(6)
plot_cancer_correlation_by_order(7)
plot_cancer_correlation_by_order(8)
plot_cancer_correlation_by_order(9)
plot_cancer_correlation_by_order(10)
plot_cancer_correlation_by_order(11)
plot_cancer_correlation_by_order(12)
plot_cancer_correlation_by_order(13)
plot_cancer_correlation_by_order(14)
plot_cancer_correlation_by_order(15)
plot_cancer_correlation_by_order(16)
plot_cancer_correlation_by_order(17)
plot_cancer_correlation_by_order(18)
plot_cancer_correlation_by_order(19)
plot_cancer_correlation_by_order(20)
plot_cancer_correlation_by_order(21)
plot_cancer_correlation_by_order(22)
plot_cancer_correlation_by_order(23)
plot_cancer_correlation_by_order(24)
plot_cancer_correlation_by_order(25)
plot_cancer_correlation_by_order(26)
plot_cancer_correlation_by_order(27)
plot_cancer_correlation_by_order(28)
plot_cancer_correlation_by_order(29)
plot_cancer_correlation_by_order(30)
plot_cancer_correlation_by_order(31)
plot_cancer_correlation_by_order(32)
plot_cancer_correlation_by_order(33)
plot_cancer_correlation_by_order(34)
plot_cancer_correlation_by_order(35)
plot_cancer_correlation_by_order(36)




######### excluding primates and reordering

#to just visualize in R
plot_cancer_correlation_by_order <- function(cancer_number) {
    selected_cancer <- cancer_list[cancer_number]
    
    cancer_data <- corrs_species_orders %>%
        filter(cancer_type == selected_cancer) %>%
        filter(order != "Primates") %>%
        arrange(desc(correlation))
    
    ordered_species <- cancer_data$species
    
    # this saves the species list as ordered for the specific cancer 
    filename <- paste0("species_sequence_", gsub("[^A-Za-z0-9]", "_", selected_cancer), ".txt")
    writeLines(as.character(ordered_species), filename)
    
    
    cancer_data$species <- factor(cancer_data$species, levels = cancer_data$species)
    
    ggplot(cancer_data, aes(x = species, y = correlation, color = order)) +
        geom_point(size = 4, alpha = 0.8) +
        scale_color_manual(values = order_colors, name = "Order") +
        guides(color = guide_legend(ncol = 2)) +
        theme_bw() +
        theme(axis.text.x = element_text(angle = 90, hjust = 1, size = 6), 
              legend.position = c(0.90, 0.75)) +
        labs(title = paste("Spearman Correlation for", selected_cancer),
             y = "Spearman Correlation",
             x = "Species (Ordered by Correlation)")
}

plot_cancer_correlation_by_order(1)


#To save all cancers svg and txt
output_dir <- "C:/Users/gi.padovani/OneDrive - University of Florida/MammalianCancer/plots_spearman_all_cancers"

# Generate all plots and save everything
plot_cancer_correlation_by_order_save <- function(cancer_number, output_dir) {
    selected_cancer <- cancer_list[cancer_number]
    
    cancer_data <- corrs_species_orders %>%
        filter(cancer_type == selected_cancer) %>%
        filter(order != "Primates") %>%
        arrange(desc(correlation))
    
    ordered_species <- cancer_data$species
    
    filename <- file.path(output_dir, paste0("species_sequence_", gsub("[^A-Za-z0-9]", "_", selected_cancer), ".txt"))
    writeLines(as.character(ordered_species), filename)
    
    cancer_data$species <- factor(cancer_data$species, levels = cancer_data$species)
    
   
    p <- ggplot(cancer_data, aes(x = species, y = correlation, color = order)) +
        geom_point(size = 4, alpha = 0.8) +
        scale_color_manual(values = order_colors, name = "Order") +
        guides(color = guide_legend(ncol = 2)) +
        theme_bw() +
        theme(axis.text.x = element_text(angle = 90, hjust = 1, size = 6), 
              legend.position = c(0.90, 0.75)) +
        labs(title = paste("Spearman Correlation for", selected_cancer),
             y = "Spearman Correlation",
             x = "Species (Ordered by Correlation)")
    
    # Save the plot
    plot_filename <- file.path(output_dir, paste0("reordered_", gsub("[^A-Za-z0-9]", "_", selected_cancer), ".svg"))
    ggsave(plot_filename, plot = p, width = 12, height = 8, dpi = 300)
    
    return(p)
}
for(i in 1:length(cancer_list)) {
    print(plot_cancer_correlation_by_order_save(i, output_dir))
    cat(paste("Saved plot and species list for cancer type", i, ":", cancer_list[i], "\n"))
}
